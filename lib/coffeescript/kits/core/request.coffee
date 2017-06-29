SGN = require '../../sgn'

module.exports = (options = {}, callback = ->) ->
    SGN.CoreKit.session.ensure (err) ->
        return callback err if err?

        baseUrl = 'https://api.etilbudsavis.dk'
        headers = options.headers ? {}
        token = SGN.CoreKit.session.get 'token'
        clientId = SGN.CoreKit.session.get 'client_id'
        appVersion = SGN.config.get 'appVersion'
        appSecret = SGN.config.get 'appSecret'
        locale = SGN.config.get 'locale'
        qs = options.qs ? {}
        geo = options.geolocation

        headers['X-Token'] = token
        headers['X-Signature'] = SGN.CoreKit.session.sign appSecret, token if appSecret?

        qs.r_locale = locale if locale?
        qs.api_av = appVersion if appVersion?
        qs.client_id = clientId if clientId?

        if geo?
            qs.r_lat = geo.latitude if geo.latitude? and not qs.r_lat?
            qs.r_lng = geo.longitude if geo.longitude? and not qs.r_lng?
            qs.r_radius = geo.radius if geo.radius? and not qs.r_radius?
            qs.r_sensor = geo.sensor if geo.sensor? and not qs.r_sensor?

        SGN.request
            method: options.method
            url: baseUrl + options.url
            qs: qs
            body: options.body
            headers: headers
            useCookies: false
        , (err, data) ->
            if err?
                callback err
            else
                token = SGN.CoreKit.session.get 'token'
                responseToken = data.headers['x-token']

                SGN.CoreKit.session.set 'token', responseToken if token isnt responseToken

                callback null, JSON.parse(data.body) if typeof callback is 'function'

            return

    return
