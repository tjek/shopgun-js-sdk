import MicroEvent from 'microevent'

class IncitoPublicationEventTracking
    constructor: (@eventTracker, @details) ->
        return

    trackOpened: (properties) ->
        return @ if not @eventTracker?

        @eventTracker.trackIncitoPublicationOpened
            'ip.paged': @details.types.indexOf('paged') > -1
            'ip.id': @details.id
            'vt': @eventTracker.createViewToken(@details.id)

        @

MicroEvent.mixin IncitoPublicationEventTracking

export default IncitoPublicationEventTracking
