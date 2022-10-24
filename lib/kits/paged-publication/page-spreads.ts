import MicroEvent from 'microevent';
import PageSpread from './page-spread';
import {V2PageDecoration} from '../core';

function chunk<I extends any>(arr: I[], size: number) {
    const results: I[][] = [];

    while (arr.length) results.push(arr.splice(0, size));

    return results;
}
export interface Page {
    id: string;
    label: string;
    pageNumber: number;
    images: {medium: string; large: string};
}
export type PageMode = 'single' | 'double';
interface PagedPublicationPageSpreadsInit {
    pages: Page[];
    pageDecorations: V2PageDecoration[];
    width: number;
    maxZoomScale: number;
}
class PagedPublicationPageSpreads extends MicroEvent {
    collection: PageSpread[] = [];
    ids = {};
    options: PagedPublicationPageSpreadsInit;
    constructor(options: PagedPublicationPageSpreadsInit) {
        super();
        this.options = options;
    }

    get(id) {
        return this.ids[id];
    }

    getFrag() {
        const frag = document.createDocumentFragment();

        this.collection.forEach((pageSpread) => {
            frag.appendChild(pageSpread.el);
        });

        return frag;
    }

    update(pageMode: PageMode = 'single') {
        const pageSpreads: Page[][] = [];
        const ids = {};
        const pages = this.options.pages.slice();
        const {width, maxZoomScale} = this.options;

        if (pageMode === 'single') {
            pages.forEach((page) => {
                pageSpreads.push([page]);
            });
        } else {
            const firstPage = pages.shift();
            const lastPage = pages.length % 2 === 1 ? pages.pop() : null;
            const midstPageSpreads = chunk(pages, 2);

            if (firstPage) pageSpreads.push([firstPage]);

            midstPageSpreads.forEach((midstPages) => {
                pageSpreads.push(midstPages);
            });

            if (lastPage) pageSpreads.push([lastPage]);
        }

        this.collection = pageSpreads.map((pages, i) => {
            const id = `${pageMode}-${i}`;
            const pageDecorations = this.getPageDecorations(pages);
            const pageSpread = new PageSpread({
                width,
                pageMode,
                maxZoomScale,
                pages,
                pageDecorations,
                id
            });

            pageSpread.bind('pageLoaded', (e) => {
                this.trigger('pageLoaded', e);
            });
            pageSpread.bind('pagesLoaded', (e) => {
                this.trigger('pagesLoaded', e);
            });

            ids[id] = pageSpread;

            return pageSpread;
        });
        this.ids = ids;

        return this;
    }

    getPageDecorations(pages) {
        const pageDecorations = this.options.pageDecorations;

        return pages.map(({pageNumber}) =>
            pageDecorations?.find(
                (pageDecor) => pageDecor.page_number == pageNumber
            )
        );
    }
}

export default PagedPublicationPageSpreads;
