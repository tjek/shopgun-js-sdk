SGN = require '../lib/coffeescript/node'

test 'isBrowser works right', ->
    expect(SGN.util.isBrowser()).toBeFalsy()
    expect(SGN.util.isNode()).toBeTruthy()

    return