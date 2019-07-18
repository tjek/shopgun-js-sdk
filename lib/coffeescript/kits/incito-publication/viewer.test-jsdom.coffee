Viewer = require('./viewer')

dummyIncito = {
    "version": "1.0.0",
    "root_view": {},
    "id": "d1b667mmocp"
}

describe 'SGN.IncitoPublicationKit.Viewer', ->
    test 'Tracks Incito Publication Opened', ->
        fakeEventTracker =
            trackIncitoPublicationOpened: jest.fn(->)
            createViewToken: jest.fn((a) -> a + "-vt")

        mountPoint = document.createElement("div")

        viewer = new Viewer mountPoint,
            id: 'incito-id'
            details:
                types: ['paged', 'incito']
            incito: dummyIncito
            eventTracker: fakeEventTracker


        viewer.start()

        expect(fakeEventTracker.trackIncitoPublicationOpened.mock.calls.length).toBe(1)
        expect(fakeEventTracker.trackIncitoPublicationOpened.mock.calls[0][0]).toEqual({
            "ip.id": "incito-id",
            "ip.paged": true,
            "vt": "incito-id-vt"
        })

        return

    return