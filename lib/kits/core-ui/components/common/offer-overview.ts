import Mustache from 'mustache';
import {
    createModal,
    destroyModal,
    formatPrice,
    translate,
    getDateRange,
    getPubState,
    getPubStateMessage
} from '../helpers/component';
import {request, V2Offer} from '../../../core';
import './offer-overview.styl';

const offerTextContainer = `\
    <div class="sgn-offer-texts-container">
        <div class="sgn-offer-heading">
            <span>{{heading}}</span>
        </div>
        <div class="sgn-offer-description">
            <span>{{description}}&nbsp;</span>
        </div>
        <div class="sgn-offer-price">
            <span>{{price}}</span>
        </div>
    </div>
    <div class="sgn-offer-buttons-container">
        {{^disableShoppingList}}
        <button class="sgn-shopping-add-to-list-btn">{{translations.addToShoppingList}}</button>
        {{/disableShoppingList}}
        {{#webshop_link}}
        <button class="sgn-shopping-open-webshop-btn">{{translations.visitWebshopLink}}</button>
        {{/webshop_link}}
    </div>\  
`;

const defaultTemplate = `\
    <div class="sgn-offer-overview-popup">
        {{#offer}}
        <div class="sgn-popup-header">
            <div class="sgn-menu-popup-labels">
                <div class="sgn-menu-label">
                    <span>{{label}}</span>
                </div>
                <div class="sgn-menu-date">
                    <span data-validity-state="{{status}}">{{dateRange}}</span>
                </div>
            </div>
        </div>
        <div class="sgn-popup-content">
            <div class="sgn-popup-offer-container">
                <div class="sgn-offer-img">
                    <img src="{{images.zoom}}" alt="{{heading}}">
                </div>
                ${offerTextContainer}
            </div>
        </div>
        {{/offer}} 
    </div>\
`;

const loaderTemplate = `\
    <div class="sgn-offer-overview-popup">
        <div class="sgn-popup-header">
            <div class="sgn-menu-popup-labels">
                <div class="sgn-menu-label">
                    <span>&nbsp;</span>
                </div>
                <div class="sgn-menu-date">
                    <span>&nbsp;</span>
                </div>
            </div>
        </div>
        <div class="sgn-popup-content">
            <div class="sgn-popup-offer-container">
                <div class="sgn-offer-img">
                    <div class="sgn_modal_loader"></div>
                </div>
                <div class="sgn-offer-texts-container">
                    <div class="sgn-offer-heading">
                        <span>&nbsp;</span>
                    </div>
                    <div class="sgn-offer-description">
                        <span>&nbsp;</span>
                    </div>
                    <div class="sgn-offer-price">
                        <span>&nbsp;</span>
                    </div>
                </div>  
                <div class="sgn-offer-buttons-container">
                    <span>&nbsp;</span>
                </div>
            </div>
        </div>
    </div>\
`;

const OfferOverview = ({
    template,
    configs,
    scriptEls,
    sgnData,
    offer,
    type,
    addToShoppingList,
    products
}) => {
    template = template?.innerHTML || defaultTemplate;
    let container: HTMLDivElement | null = null;

    const translations = {
        localeCode: translate('locale_code'),
        currency: translate('publication_viewer_currency'),
        addToShoppingList: translate('publication_viewer_add_to_shopping_list'),
        visitWebshopLink: translate('publication_viewer_visit_webshop_link')
    };

    const render = async () => {
        container = document.createElement('div');
        container.className = 'sgn-offer-overview-container';

        createModal(container);
        container.innerHTML = Mustache.render(loaderTemplate, {});
        const transformedOffer =
            type === 'paged'
                ? await fetchOffer(offer.id)
                : transformIncitoOffer(offer);

        container.innerHTML = Mustache.render(template, {
            translations,
            label: sgnData?.details?.label,
            disableShoppingList: document.querySelector('.sgn__offer-shopping')
                ? false
                : true,
            offer: transformedOffer
        });

        productTransformer(
            products['tjek.offer.v1'].products,
            transformedOffer
        );
        dispatchOfferClickEvent(transformedOffer);
        addEventListeners();
    };

    const productTransformer = async (products, transformedOffer) => {
        if (products.length >= 1) {
            for (let i = 1; i < products.length; i++) {
                const el: HTMLElement | null = document.querySelector(
                    '.sgn-popup-offer-container'
                );

                const containterEl = document.createElement('div');
                containterEl.className = 'sgn-popup-offer-container';
                if (el) el.after(containterEl);

                containterEl.innerHTML = Mustache.render(offerTextContainer, {
                    translations,
                    disableShoppingList: document.querySelector(
                        '.sgn__offer-shopping'
                    )
                        ? false
                        : true,
                    heading: products[i].title,
                    description: transformedOffer.description
                });

                containterEl
                    ?.querySelector('.sgn-shopping-add-to-list-btn')
                    ?.addEventListener('click', () => {
                        addToShoppingList(offer);
                        destroyModal();
                    });
            }
        }
    };

    const transformIncitoOffer = (offer) => {
        const {localeCode, currency} = translations;

        return {
            ...offer,
            heading: offer.name,
            price: formatPrice(
                offer?.price,
                localeCode,
                offer?.currency_code || currency
            ),
            images: {
                zoom: offer?.images?.[0]?.url
            },
            dateRange: getDateRange(
                offer?.validity?.from,
                offer?.validity?.to,
                'publication_viewer_offer_date_range'
            ),
            status: getPubState(offer?.validity?.from, offer?.validity?.to),
            statusMessage: getPubStateMessage(
                offer?.validity?.from,
                offer?.validity?.to
            )
        };
    };

    const addOpenWebshopListener = () => {
        container
            ?.querySelector('.sgn-shopping-open-webshop-btn')
            ?.addEventListener('click', () => {
                window.open(offer.webshop_link);
            });
    };

    const addShoppingListListener = () => {
        container
            ?.querySelector('.sgn-shopping-add-to-list-btn')
            ?.addEventListener('click', () => {
                addToShoppingList(offer);
                destroyModal();
            });
    };

    const fetchOffer = async (id: string) => {
        const {localeCode, currency} = translations;
        const offer = await request<V2Offer>({
            apiKey: configs.apiKey,
            coreUrl: configs.coreUrl,
            url: `/v2/offers/${id}`
        });

        return {
            ...offer,
            price: formatPrice(
                offer?.pricing?.price,
                localeCode,
                offer?.pricing?.currency || currency
            ),
            dateRange: getDateRange(
                offer?.run_from,
                offer?.run_till,
                'publication_viewer_offer_date_range'
            ),
            status: getPubState(offer?.run_from, offer?.run_till),
            statusMessage: getPubStateMessage(offer?.run_from, offer?.run_till)
        };
    };

    const dispatchOfferClickEvent = (detail) => {
        const mainContainerEl = document.querySelector(
            scriptEls.listPublicationsContainer || scriptEls.mainContainer
        );

        mainContainerEl?.dispatchEvent(
            new CustomEvent('publication:offer_modal_rendered', {
                detail
            })
        );
    };

    const addEventListeners = () => {
        document.querySelector<HTMLDivElement>('.sgn-modal-container')?.focus();

        addOpenWebshopListener();
        addShoppingListListener();
    };

    return {render};
};

export default OfferOverview;
