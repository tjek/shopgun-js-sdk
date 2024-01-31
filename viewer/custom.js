(function () {
    var urlParams = new URLSearchParams(window.location.search);

    var data = {
        businessId: urlParams.get('businessId'),
        apiKey: urlParams.get('apiKey') ?? '',
        trackId: urlParams.get('trackId') ?? '',
        localeCode: urlParams.get('localeCode'),
        componentType: urlParams.get('componentType') || 'list-publications',
        preferredViewerType: urlParams.get('preferredViewerType') || 'incito',
        listPublicationsContainer: 'list-publications',
        publicationContainer: 'publication-container',
        publicationHash: urlParams.get('publicationHash') || 'publication',
        publicationQueryIdParam:
            urlParams.get('publicationQueryIdParam') || 'publicationid',
        publicationQueryPageParam:
            urlParams.get('publicationQueryPageParam') || 'publicationpage',
        urlParamsType: urlParams.get('urlParamsType'),
        navigationType: urlParams.get('navigationType') || 'header',
        disableHeader: urlParams.get('disableHeader') || false,
        disableClose: urlParams.get('disableClose') || false,
        disableMenu: urlParams.get('disableMenu') || false,
        disableShoppingList: urlParams.get('disableShoppingList') || false,
        showHeaderLabels: urlParams.get('showHeaderLabels') || true,
        disableDownload: urlParams.get('disableDownload') || false,
        disableGlobalScrollbar:
            urlParams.get('disableGlobalScrollbar') || false,
        disablePageDecorations:
            urlParams.get('disablePageDecorations') || false,
        disableLazyload: urlParams.get('disableLazyload') || false,
        requestFilter: urlParams.get('requestFilter'),
        clientFilter: urlParams.get('clientFilter'),
        utmSource: urlParams.get('utmSource'),
        utmMedium: urlParams.get('utmMedium'),
        publicationId: urlParams.get('publicationId'),
        offerClickBehavior:
            urlParams.get('offerClickBehavior') || 'overview_modal',
        tags: (() => {
            try {
                return JSON.parse(urlParams.get('tags'));
            } catch (e) {
                return null;
            }
        })()
    };

    var scriptEl = document.createElement('script');
    scriptEl.id = 'sgn-sdk';
    scriptEl.src = 'https://d21oefkcnoen8i.cloudfront.net/sgn-sdk-4.x.x.min.js';
    scriptEl.dataset.apiKey = data.apiKey;
    scriptEl.dataset.trackId = data.trackId;
    scriptEl.dataset.businessId = data.businessId;
    scriptEl.dataset.localeCode = data.localeCode;
    scriptEl.dataset.component = data.componentType;

    if (data.componentType === 'list-publications') {
        scriptEl.dataset.componentListPublicationsContainer = `#list-publications`;
        scriptEl.dataset.componentPublicationsViewerPreferredType =
            data.preferredViewerType;
    } else {
        scriptEl.dataset.componentPublicationContainer = `#publication-container`;
    }

    if (data.disableShoppingList) {
        scriptEl.dataset.componentPublicationDisableShoppingList = String(
            data.disableShoppingList
        );
    }
    if (data.urlParamsType !== '') {
        scriptEl.dataset.componentPublicationDisplayUrlParams =
            data.urlParamsType;
    }
    if (data.publicationHash !== 'publication') {
        scriptEl.dataset.publicationHash = data.publicationHash;
    }
    if (data.publicationQueryIdParam !== 'publicationid') {
        scriptEl.dataset.publicationIdQueryParam = data.publicationQueryIdParam;
    }
    if (data.publicationQueryPageParam !== 'publicationpage') {
        scriptEl.dataset.publicationPageQueryParam =
            data.publicationQueryPageParam;
    }
    if (data.disableShoppingList) {
        scriptEl.dataset.componentPublicationDisableShoppingList = String(
            data.disableShoppingList
        );
    }
    if (data.disableClose) {
        scriptEl.dataset.componentPublicationDisableClose = String(
            data.disableClose
        );
    }
    if (data.disableMenu) {
        scriptEl.dataset.componentPublicationDisableMenu = String(
            data.disableMenu
        );
    }
    if (data.disableDownload) {
        scriptEl.dataset.componentPublicationDisableDownload = String(
            data.disableDownload
        );
    }
    if (data.disableHeader) {
        scriptEl.dataset.componentPublicationDisableHeader = String(
            data.disableHeader
        );
    }
    if (data.navigationType === 'sidebar-right') {
        scriptEl.dataset.componentPublicationEnableSidebar = String(true);
    }
    if (data.navigationType === 'sidebar-left') {
        scriptEl.dataset.componentPublicationEnableSidebar = String(true);
        scriptEl.dataset.componentPublicationSidebarPosition = 'left';
    }
    if (data.disableGlobalScrollbar) {
        scriptEl.dataset.componentPublicationDisableGlobalScrollbar = String(
            data.disableGlobalScrollbar
        );
    }
    if (data.disablePageDecorations) {
        scriptEl.dataset.componentPublicationDisablePagedecorations = String(
            data.disablePageDecorations
        );
    }
    if (!data.disableLazyload) {
        scriptEl.dataset.componentPublicationEnableLazyload = 'true';
    }
    if (data.showHeaderLabels) {
        scriptEl.dataset.componentPublicationShowHeaderLabels = String(
            data.showHeaderLabels
        );
    }
    if (data.offerClickBehavior != 'shopping_list') {
        scriptEl.dataset.componentPublicationViewerOfferClickBehavior =
            data.offerClickBehavior;
    }
    if (data.requestFilter) {
        scriptEl.dataset.componentListPublicationsRequestFilter =
            data.requestFilter;
    }
    if (data.clientFilter) {
        scriptEl.dataset.componentListPublicationsClientFilter =
            data.clientFilter;
    }
    if (data.utmSource) {
        scriptEl.dataset.componentPublicationUtmSource = data.utmSource;
    }
    if (data.utmMedium) {
        scriptEl.dataset.componentPublicationUtmMedium = data.utmMedium;
    }
    if (data.publicationId) {
        scriptEl.dataset.componentPublicationId = data.publicationId;
    }
    if (data.tags?.length) {
        scriptEl.dataset.componentListPublicationsRequestFilter = `tags:${data.tags.join()};`;
    }
    scriptEl.defer = true;

    document.body.appendChild(scriptEl);
})();
