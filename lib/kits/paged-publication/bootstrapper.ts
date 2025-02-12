import {request, V2Catalog, V2Hotspot, V2Page, V2PageDecoration} from '../core';
import type {Tracker} from '../events';
import Viewer, {ViewerInit} from './viewer';

interface BootstrapperInit {
    el: HTMLElement;
    id: string;
    pageId: string;
    eventTracker: Tracker;
    apiKey: string;
    coreUrl: string;
    keyboard: 'disabled' | 'enabled' | 'global';
}
export default class Bootstrapper {
    options: BootstrapperInit;
    constructor(options = {}) {
        //@ts-expect-error
        this.options = options;
    }

    createViewer(
        data: {details: V2Catalog; pages: V2Page[]},
        viewerOptions?: Partial<ViewerInit>
    ) {
        return new Viewer(this.options.el!, {
            id: this.options.id,
            ownedBy: data.details.dealer_id,
            color: '#' + data.details.branding.pageflip.color,
            hotspotRatio: data.details.dimensions.height,
            keyboard: this.options.keyboard ?? 'enabled',
            pageId: this.options.pageId,
            eventTracker: this.options.eventTracker,
            pages: data.pages.map(({view, zoom}, i) => {
                const pageNumber = i + 1;

                return {
                    id: 'page' + pageNumber,
                    label: String(pageNumber),
                    pageNumber,
                    images: {medium: view, large: zoom}
                };
            }),
            ...viewerOptions
        });
    }

    transformPageDecorationHotspots(pageDecorations: V2PageDecoration[]) {
        const filteredPageDecorations = pageDecorations?.filter(
            (pageDecoration) => pageDecoration.hotspots?.length
        );
        const pageDecorationHotspots: {
            id: string;
            type: string;
            embed_link: string;
            link: string;
            rotate: number;
            locations: any;
        }[] = [];

        filteredPageDecorations.forEach((pageDecoration) => {
            pageDecoration.hotspots?.forEach((hotspot, index) => {
                pageDecorationHotspots.push({
                    id: `page${pageDecoration.page_number}-hotspot-${index}`,
                    type: 'pagedecoration',
                    embed_link: hotspot.embed_link,
                    link: hotspot.link,
                    rotate: hotspot.rotate,
                    locations: {
                        [pageDecoration.page_number]: [
                            [hotspot.x1 / 100, hotspot.y1 / 100],
                            [hotspot.x1 / 100, hotspot.y2 / 100],
                            [hotspot.x2 / 100, hotspot.y2 / 100],
                            [hotspot.x2 / 100, hotspot.y1 / 100]
                        ]
                    }
                });
            });
        });

        return pageDecorationHotspots;
    }

    applyHotspots(
        viewer: Viewer,
        hotspots: V2Hotspot[],
        pageDecorations?: V2PageDecoration[]
    ) {
        let pageDecorationHotspots;

        if (pageDecorations?.length) {
            pageDecorationHotspots =
                this.transformPageDecorationHotspots(pageDecorations);

            if (pageDecorationHotspots.length) {
                hotspots = hotspots.concat(pageDecorationHotspots);
            }
        }

        viewer.applyHotspots(
            hotspots.reduce((obj, hotspot) => {
                obj[hotspot.id] = hotspot;

                return obj;
            }, {})
        );
    }

    async fetch(callback?: Parameters<typeof request>[1]) {
        try {
            const {0: details, 1: pages} = await Promise.all([
                this.fetchDetails(),
                this.fetchPages()
            ]);

            if (!details || !pages) throw new Error();

            const data = {details, pages};
            if (typeof callback === 'function') callback(null, data);

            return data;
        } catch (error) {
            if (typeof callback === 'function') {
                callback(error);
            } else {
                throw error;
            }
        }
    }

    fetchDetails = (callback?: Parameters<typeof request>[1]) =>
        request<V2Catalog>(
            {
                apiKey: this.options.apiKey,
                coreUrl: this.options.coreUrl,
                url: `/v2/catalogs/${this.options.id}`
            },
            callback
        );

    fetchPages = (callback?: Parameters<typeof request>[1]) =>
        request<V2Page[]>(
            {
                apiKey: this.options.apiKey,
                coreUrl: this.options.coreUrl,
                url: `/v2/catalogs/${this.options.id}/pages`
            },
            callback
        );

    fetchHotspots = (callback?: Parameters<typeof request>[1]) =>
        request<V2Hotspot[]>(
            {
                apiKey: this.options.apiKey,
                coreUrl: this.options.coreUrl,
                url: `/v2/catalogs/${this.options.id}/hotspots`
            },
            callback
        );

    fetchPageDecorations = (callback?: Parameters<typeof request>[1]) =>
        request<V2PageDecoration[]>(
            {
                apiKey: this.options.apiKey,
                coreUrl: this.options.coreUrl,
                url: `/v2/catalogs/${this.options.id}/page_decorations`
            },
            callback
        );

    applyPageDecorations(viewer: Viewer, pageDecorations: V2PageDecoration[]) {
        viewer.applyPageDecorations(pageDecorations);
    }
}
