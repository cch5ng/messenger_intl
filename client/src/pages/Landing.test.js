const rewire = require("rewire")
const Landing = rewire("./Landing")
const landinPageStyle = Landing.__get__("landinPageStyle")
const LandingPage = Landing.__get__("LandingPage")
// @ponicode
describe("landinPageStyle", () => {
    test("0", () => {
        let callFunction = () => {
            landinPageStyle({ spacing: { unit: -10 } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            landinPageStyle({ spacing: { unit: 0 } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            landinPageStyle({ spacing: { unit: 1 } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            landinPageStyle({ spacing: { unit: -100 } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            landinPageStyle({ spacing: { unit: 100 } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            landinPageStyle(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("componentDidMount", () => {
    let inst

    beforeEach(() => {
        inst = new LandingPage()
    })

    test("0", () => {
        let callFunction = () => {
            inst.componentDidMount()
        }
    
        expect(callFunction).not.toThrow()
    })
})
