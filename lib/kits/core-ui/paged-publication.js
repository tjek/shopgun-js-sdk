import * as PagedPublicationKit from '../paged-publication';
import * as PagedPublicationComponents from './components/paged-publication';
import * as clientLocalStorage from '../../storage/client-local';
import {request} from '../core';
import SGN from '../../sgn-sdk';

export default class PagedPublication {
    constructor(scriptEl, mainContainer = '') {
        this.options = {};
        this.scriptEl = scriptEl;
        this.scriptEls = {
            mainContainer:
                scriptEl.getAttribute(
                    'data-component-paged-publication-viewer-container'
                ) || mainContainer
        };
        this.renderMainContainer();
    }

    async render() {
        if (Object.keys(this.options).length === 0) {
            await this.setOptions();
        }

        this.start();

        this.renderOfferList();
        this.renderShoppingList();
        this.renderPageList();
        this.renderDownload();
    }

    renderMainContainer() {
        const mainContainerEl = document.querySelector(
            this.scriptEls.mainContainer
        );
        const customTemplate = document.getElementById(
            'sgn-sdk-paged-publication-viewer-template'
        );

        const mainContainer = new PagedPublicationComponents.MainContainer({
            template: customTemplate,
            el: mainContainerEl
        });
        mainContainer.render();
    }

    renderOfferList() {
        const customTemplate = document.getElementById(
            'sgn-sdk-paged-publication-viewer-offer-list-template'
        );
        const offerList = new PagedPublicationComponents.OfferList({
            configs: this.options,
            template: customTemplate
        });
        offerList.render();
    }

    renderShoppingList() {
        const customTemplate = document.getElementById(
            'sgn-sdk-paged-publication-viewer-shopping-list-template'
        );
        const shoppingList = new PagedPublicationComponents.ShoppingList({
            template: customTemplate
        });
        shoppingList.render();
    }

    renderPageList() {
        const customTemplate = document.getElementById(
            'sgn-sdk-paged-publication-viewer-page-list-template'
        );
        const pageList = new PagedPublicationComponents.PageList({
            configs: this.options,
            template: customTemplate,
            scriptEl: this.scriptEl,
            mainContainer: this.scriptEls.mainContainer
        });
        pageList.render();
    }

    renderDownload() {
        const download = new PagedPublicationComponents.PublicationDownload({
            configs: this.options
        });
        download.render();
    }

    async setOptions(options = {}) {
        this.options = {
            el: document.querySelector('.sgn__pp'),
            eventTracker: SGN.config.get('eventTracker'),
            pageId:
                options.pageId || `page${SGN.util.getQueryParam('page') || 1}`,
            id:
                options.id ||
                SGN.util.getQueryParam('publicationid') ||
                SGN.config.get('publicationId') ||
                '',
            dealerId: options.dealerId || SGN.config.get('businessId')
        };

        if (!this.options.id) {
            this.options.id = await this.fetchLatestCatId();
        }
    }

    start() {
        const bootstrapper = new PagedPublicationKit.Bootstrapper(this.options);

        bootstrapper.fetch((err, data) => {
            if (!err) {
                const viewer = bootstrapper.createViewer(data);
                console.log(viewer);

                viewer.bind('hotspotClicked', (hotspot) => {
                    console.log('Hotspot clicked', hotspot);

                    if (
                        !clientLocalStorage.get(
                            'paged-publication-saved-offers'
                        )
                    ) {
                        clientLocalStorage.set(
                            'paged-publication-saved-offers',
                            [hotspot]
                        );
                    } else {
                        const clientLocal = clientLocalStorage.get(
                            'paged-publication-saved-offers'
                        );
                        clientLocal.push(hotspot);
                        clientLocalStorage.set(
                            'paged-publication-saved-offers',
                            clientLocal
                        );
                    }

                    if (hotspot.webshop) {
                        window.location = hotspot.webshop;
                    }
                });

                viewer.bind('hotspotPressed', (hotspot) => {
                    console.log('Hotspot pressed', hotspot);
                });

                viewer.bind('hotspotContextmenu', (hotspot) => {
                    console.log('Hotspot contextmenu', hotspot);
                });

                viewer.start();

                // Fetch hotspots after rendering the viewer as they are not critical for initial render.
                bootstrapper.fetchHotspots((err2, hotspots) => {
                    if (!err2) {
                        bootstrapper.applyHotspots(viewer, hotspots);
                    }
                });
            } else {
                console.error(err);
            }
        });
    }

    fetchLatestCatId() {
        return new Promise((resolve) => {
            request(
                {
                    url: '/v2/catalogs',
                    qs: {
                        dealer_id: SGN.config.get('businessId'),
                        order_by: '-publication_date',
                        limit: 1
                    }
                },
                (err, catalogs) => {
                    if (!err) {
                        const config = {
                            publicationId: catalogs[0].id
                        };
                        SGN.config.set(config);
                        resolve(catalogs[0].id);
                    }
                }
            );
        });
    }
}