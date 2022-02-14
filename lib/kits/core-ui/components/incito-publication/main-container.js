import Mustache from 'mustache';
import {ESC as EscKey} from '../../../../key-codes';
import * as clientLocalStorage from '../../../../storage/client-local';
import './main-container.styl';

const defaultTemplate = `\
    <div class="sgn__incito" data-component-template="true" {{#disableHeader}}data-component-template-disable-header="true"{{/disableHeader}}>
    {{^disableHeader}}
        <div class="sgn__header">
            <div class="sgn__nav">
                {{^disableClose}}
                    <button class="sgn__close-publication">
                        <svg
                            aria-hidden="true"
                            class="sgn-header-icon-svg sgn-header-icon-svg-close"
                            role="img" viewBox="0 0 320 512"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill="currentColor"
                                d="M193.94 256L296.5 153.44l21.15-21.15c3.12-3.12 3.12-8.19 0-11.31l-22.63-22.63c-3.12-3.12-8.19-3.12-11.31 0L160 222.06 36.29 98.34c-3.12-3.12-8.19-3.12-11.31 0L2.34 120.97c-3.12 3.12-3.12 8.19 0 11.31L126.06 256 2.34 379.71c-3.12 3.12-3.12 8.19 0 11.31l22.63 22.63c3.12 3.12 8.19 3.12 11.31 0L160 289.94 262.56 392.5l21.15 21.15c3.12 3.12 8.19 3.12 11.31 0l22.63-22.63c3.12-3.12 3.12-8.19 0-11.31L193.94 256z"
                            >
                            </path>
                        </svg>
                    </button>
                {{/disableClose}}
                {{^disableShoppingList}}
                    <button class="sgn__offer-shopping">
                        <svg
                            aria-hidden="true"
                            class="sgn-header-icon-svg"
                            role="img"
                            viewBox="0 0 512 512"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill="currentColor"
                                d="M48 368a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0-160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0-160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm448 24H176a16 16 0 0 0-16 16v16a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V88a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v16a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-16a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v16a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-16a16 16 0 0 0-16-16z"
                            >
                            </path>
                        </svg>
                        <div class="sgn__offer-shopping-list-count"><div>
                    </button>
                {{/disableShoppingList}}
                {{^disableMenu}}
                    <button class="sgn__nav-menu-btn">
                        <svg
                            aria-hidden="true"
                            class="sgn-header-icon-svg"
                            role="img"
                            viewBox="0 0 512 512"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill="currentColor"
                                d="M304 256c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48zm120-48c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48zm-336 0c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48z"
                            >
                            </path>
                        </svg>
                    </button>
                {{/disableMenu}}
            </div>
        </div>
    {{/disableHeader}}

    <div class="sgn-incito__progress"></div>
    </div>\
`;

const defaultShoppingListCounterTemplate = `\
{{#shoppingListCount}}
    <div class="sgn__offer-shopping-list-counter">
        <span>{{shoppingListCount}}</span>
    </div>
{{/shoppingListCount}}\
`;

const MainContainer = ({
    template,
    shoppingListCounterTemplate,
    el,
    scriptEls
}) => {
    template = template?.innerHTML || defaultTemplate;

    const body = document.body;

    body.classList.add('body-sgn__incito');

    el.innerHTML = Mustache.render(template, {
        disableHeader: scriptEls.disableHeader,
        disableShoppingList:
            scriptEls.disableShoppingList ||
            scriptEls.offerClickBehavior !== 'shopping_list',
        disableMenu: scriptEls.disableMenu,
        disableClose: scriptEls.disableClose
    });

    const setCustomStyles = () => {
        const sgnPp = el.querySelector('.sgn__incito');
        sgnPp.classList.add(`sgn__theme-${scriptEls.theme || 'light'}`);
    };

    const renderShoppingListCounter = () => {
        const shoppingListCountEl = el.querySelector(
            '.sgn__offer-shopping-list-count'
        );

        if (shoppingListCountEl) {
            const storedPublicationOffers = clientLocalStorage.get(
                'paged-publication-saved-offers'
            );

            shoppingListCountEl.innerHTML = Mustache.render(
                shoppingListCounterTemplate?.innerHTML ||
                    defaultShoppingListCounterTemplate,
                {shoppingListCount: storedPublicationOffers?.length}
            );
        }
    };

    const addClosePubListener = () => {
        const sgnPp = el.querySelector('.sgn__incito');
        const closeBtn = el.querySelector('.sgn__close-publication');

        closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            sgnPp?.parentNode?.removeChild(sgnPp);
        });

        sgnPp.addEventListener(
            'keyup',
            (e) => {
                if (e.keyCode === EscKey && closeBtn) {
                    sgnPp?.parentNode?.removeChild(sgnPp);
                }
            },
            false
        );
    };

    const addStorageListener = () => {
        window.addEventListener(
            'tjek_shopping_list_update',
            renderShoppingListCounter,
            false
        );
    };

    const render = () => {
        setCustomStyles();
        renderShoppingListCounter();
        addStorageListener();
        addClosePubListener();
    };

    return {render};
};

export default MainContainer;