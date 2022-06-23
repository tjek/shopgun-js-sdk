import {request, V2Catalog, V2Page} from '../core';
import {Tracker} from '../events';
import Viewer, {ViewerInit} from './viewer';

interface BootstrapperInit {
    el: HTMLElement;
    id: string;
    pageId: string;
    eventTracker: Tracker;
    apiKey: string;
    coreUrl: string;
}
export default class Bootstrapper {
    options: BootstrapperInit;
    constructor(options = {}) {
        //@ts-expect-error
        this.options = options;
    }

    createViewer(
        data: {details: V2Catalog; pages: V2Page[]},
        viewerOptions: Partial<ViewerInit>
    ) {
        return new Viewer(this.options.el!, {
            id: this.options.id,
            ownedBy: data.details.dealer_id,
            color: '#' + data.details.branding.pageflip.color,
            hotspotRatio: data.details.dimensions.height,
            keyboard: true,
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

    applyHotspots(viewer, hotspots) {
        viewer.applyHotspots(
            hotspots.reduce((obj, hotspot) => {
                obj[hotspot.id] = hotspot;

                return obj;
            }, {})
        );
    }

    async fetch(callback) {
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

    fetchDetails = (callback?: (error: Error | null, result?: any) => void) =>
        request(
            {
                apiKey: this.options.apiKey,
                coreUrl: this.options.coreUrl,
                url: `/v2/catalogs/${this.options.id}`
            },
            callback
        );

    fetchPages = (callback?: (error: Error | null, result?: any) => void) =>
        request(
            {
                apiKey: this.options.apiKey,
                coreUrl: this.options.coreUrl,
                url: `/v2/catalogs/${this.options.id}/pages`
            },
            callback
        );

    fetchHotspots = (callback) =>
        request(
            {
                apiKey: this.options.apiKey,
                coreUrl: this.options.coreUrl,
                url: `/v2/catalogs/${this.options.id}/hotspots`
            },
            callback
        );
}