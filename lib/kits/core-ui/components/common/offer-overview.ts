import Mustache from 'mustache';
import {
    createModal,
    destroyModal,
    formatPrice,
    translate,
    getDateRange,
    getPubState,
    getPubStateMessage,
    parseDateStr
} from '../helpers/component';
import {request, V2Offer} from '../../../core';
import * as clientLocalStorage from '../../../../storage/client-local';
import './offer-overview.styl';

const defaultTemplate = `\
    <div class="sgn-offer-overview-popup">
        {{#offer}}
        <div class="sgn-popup-header">
            <div class="sgn-menu-popup-labels">
                <div class="sgn-menu-label">
                    <span>{{label}}&nbsp;</span>
                </div>
                <div class="sgn-menu-date">
                    <span data-validity-state="{{status}}">{{dateRange}}&nbsp;</span>
                </div>
            </div>
        </div>
        <div class="sgn-popup-content">
            <div class="sgn-popup-offer-container">
                <div class="sgn-offer-img">
                    {{#loader}}
                    <div class="sgn_modal_loader"></div>
                    {{/loader}}
                    {{^loader}}
                    <img src="{{images.zoom}}" alt="{{heading}}">
                    {{/loader}}
                </div>
                <div class="sgn-offer-texts-container">
                    <div class="sgn-offer-heading">
                        <span>{{heading}}&nbsp;</span>
                    </div>
                    <div class="sgn-offer-description">
                        <span>{{description}}&nbsp;</span>
                    </div>
                    <div class="sgn-offer-price">
                        <span>{{price}}&nbsp;</span>
                    </div>
                </div>  
                <div class="sgn-offer-buttons-container">
                    {{^disableShoppingList}}
                    <button class="sgn-shopping-add-to-list-btn">{{translations.addToShoppingList}}</button>
                    {{/disableShoppingList}}
                    {{#webshop_link}}
                    <button class="sgn-shopping-open-webshop-btn">{{translations.visitWebshopLink}}</button>
                    {{/webshop_link}}
                </div>
            </div>
        </div>
        {{/offer}} 
    </div>\
`;

const defaultTemplateV2 = `\
    <div class="sgn-offer-overview-popup sgn-offer-overview-popup-v2">
        {{#offer}}
        <div class="sgn-popup-content">
            <div class="sgn-popup-offer-container">
                {{#loader}}
                <div class="sgn-offer-img sgn-offer-img-v2">
                    <div class="sgn_modal_loader"></div>
                </div>
                {{/loader}}
                {{^loader}}
                <div class="sgn-offer-img">
                    <img src="{{images.zoom}}" alt="{{heading}}">
                </div>
                <div class="sgn-offer-details-container">
                    <button class="sgn-modal-close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>
                    </button>
                    <div class="sgn-popup-header">
                        <div class="sgn-menu-popup-labels">
                            <div class="sgn-menu-label">
                                <span>{{label}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="sgn-offer-texts-container">
                        <div class="sgn-offer-info">
                            <div class="sgn-offer-heading">
                                <span>{{heading}}</span>
                            </div>
                            <div class="sgn-offer-description">
                                <span>{{description}}</span>
                            </div>
                        </div>
                        <div class="sgn-offer-price">
                            <span>{{price}}</span>
                        </div>
                    </div>
                    <div class="sgn-products-container">
                        <div class="sgn-products-texts-container">
                            {{#products}}
                            <div id="sgn-offer-product-{{id}}" data-offer-product-id="{{id}}" data-offer-product-quantity="{{quantity}}" class="sgn-product-details">
                                <div class="sgn-product-image"><img src="{{#image}}{{image}}{{/image}}{{^image}}{{images.zoom}}{{/image}}" alt="{{heading}}"></div>
                                <div class="sgn-product-heading">
                                    <div class="sgn-product-title">
                                        <span>{{title}}</span>
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" class="arrow-up-right-from-square" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>
                                        </span>
                                    </div>
                                    <div class="sgn-product-description"><span>{{description}}</span></div>
                                </div>
                                <div id="sgn-offer-product-quantity-{{id}}" class="sgn-offer-product-quantity">
                                    <div class="sgn-offer-product-quantity-content">
                                        <button id="sgn-offer-product-quantity-minus-{{id}}" class="sgn-offer-product-quantity-minus">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-minus-circle-fill" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>
                                        </button>
                                        <input type="text" id="sgn-offer-product-quantity-text-{{id}}" class="sgn-offer-product-quantity-text" value="{{quantity}}" disabled/>
                                        <button id="sgn-offer-product-quantity-plus-{{id}}" class="sgn-offer-product-quantity-plus">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-plus-circle-fill" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
                                        </button>
                                    </div>
                                </div>
                                <div class="sgn-product-price"><span>{{price}}</span></div>
                            </div>
                            {{/products}}
                        </div>
                    </div>
                    <div class="sgn-menu-date">
                        <span>Tilbuddet gælder kun fra d. </span>                    
                        <span data-validity-state="{{status}}">{{dateRange}}</span>
                    </div>
                </div>
                {{/loader}}
            </div>
        </div>
        {{/offer}}
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
    updateShoppingList
}) => {
    template =
        template?.innerHTML ||
        (scriptEls.offerModalVersion == 2 && type === 'incito'
            ? defaultTemplateV2
            : defaultTemplate);
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

        container.innerHTML = Mustache.render(template, {
            translations,
            label: '',
            disableShoppingList: document.querySelector('.sgn__offer-shopping')
                ? false
                : true,
            offer: {},
            loader: true,
            layoutWidth: sgnData?.incito?.root_view?.layout_width
        });

        const transformedOffer =
            type === 'paged'
                ? await fetchOffer(offer.id)
                : await transformIncitoOffer(offer);

        container.innerHTML = Mustache.render(template, {
            translations,
            label: sgnData?.details?.label,
            disableShoppingList: document.querySelector('.sgn__offer-shopping')
                ? false
                : true,
            offer: transformedOffer,
            layoutWidth: sgnData?.incito?.root_view?.layout_width
        });

        dispatchOfferClickEvent(transformedOffer);
        addEventListeners();
    };

    const transformProducts = (products, fetchedProducts) => {
        const storedPublicationOffers =
            clientLocalStorage.get('publication-saved-offers') || [];

        return products?.map((product, index) => {
            const matchingOffer = storedPublicationOffers.find(
                (offer) => offer.id === product.id
            );
            return {
                ...product,
                image: fetchedProducts[index]?.product?.images?.[0]?.assets?.[0]
                    ?.url,
                quantity: matchingOffer ? matchingOffer.quantity : 0
            };
        });
    };

    const transformIncitoOffer = async ({
        fetchOffer,
        fetchProducts,
        viewId,
        publicationId,
        products
    }) => {
        const {localeCode, currency} = translations;
        const {offer: incitoOffer} = await fetchOffer({viewId, publicationId});
        offer = incitoOffer;
        const {offer_products} = await fetchProducts(offer.id);
        offer.products = transformProducts(products, offer_products);

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
                new Date(
                    Number(parseDateStr(offer?.validity?.to)) - 1000
                ).toISOString(),
                'publication_viewer_offer_date_range'
            ),
            status: getPubState(
                offer?.validity?.from,
                new Date(
                    Number(parseDateStr(offer?.validity?.to)) - 1000
                ).toISOString()
            ),
            statusMessage: getPubStateMessage(
                offer?.validity?.from,
                new Date(
                    Number(parseDateStr(offer?.validity?.to)) - 1000
                ).toISOString()
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

        if (offer.id && configs.eventTracker) {
            configs.eventTracker?.trackOfferOpened({
                'of.id': offer.id,
                vt: configs.eventTracker.createViewToken(offer.id)
            });
        }

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

    const addProductListener = () => {
        const productEls = document.querySelectorAll('.sgn-product-details');

        productEls.forEach((productEl: HTMLElement) => {
            const productId = productEl.dataset.offerProductId;
            const minusBtn = productEl.querySelector<HTMLElement>(
                '.sgn-offer-product-quantity-minus'
            );
            const plusBtn = productEl.querySelector<HTMLElement>(
                '.sgn-offer-product-quantity-plus'
            );
            const quantityTxt = productEl.querySelector<HTMLInputElement>(
                '.sgn-offer-product-quantity-text'
            );
            const basketBtn = productEl.querySelector<HTMLElement>(
                '.sgn-offer-product-add-basket'
            );

            let quantity = +(quantityTxt?.value ?? 0);

            plusBtn?.addEventListener('click', () => {
                if (quantityTxt) quantityTxt.value = `${++quantity}`;

                productEl.dataset.offerProductQuantity = `${quantity}`;

                updateShoppingList(
                    {
                        ...offer,
                        basket: {
                            productId,
                            quantity
                        }
                    },
                    'add'
                );
            });

            minusBtn?.addEventListener('click', () => {
                if (quantityTxt && quantity >= 1)
                    quantityTxt.value = `${--quantity}`;

                productEl.dataset.offerProductQuantity = `${quantity}`;

                updateShoppingList(
                    {
                        ...offer,
                        basket: {
                            productId,
                            quantity
                        }
                    },
                    'minus'
                );
            });

            basketBtn?.addEventListener('click', () => {
                addToShoppingList({
                    ...offer,
                    basket: {
                        productId,
                        quantity
                    }
                });
            });
        });
    };

    const closeModalListener = () => {
        container
            ?.querySelector('.sgn-modal-close')
            ?.addEventListener('click', () => {
                destroyModal();
            });
    };

    const addEventListeners = () => {
        document.querySelector<HTMLDivElement>('.sgn-modal-container')?.focus();

        addOpenWebshopListener();
        addShoppingListListener();
        addProductListener();
        closeModalListener();
    };

    return {render};
};

export default OfferOverview;
