import * as t from '../..'
import { isSuccess } from 'aelastics-result'

describe('StringTest', () => {
  it('Testing if undefined is valid', () => {
    const StringType = t.string
    let s = undefined
    expect(isSuccess(StringType.validate((s as unknown) as any))).toBe(false)
  })
  it('Testing if number is valid', () => {
    const StringType = t.string
    let s = 25
    expect(isSuccess(StringType.validate((s as unknown) as any))).toBe(false)
  })
  it('Testing if bool is valid', () => {
    const StringType = t.string
    let s = true
    expect(isSuccess(StringType.validate((s as unknown) as any))).toBe(false)
  })
  it('Testing if null is valid', () => {
    const StringType = t.string
    let s = null
    expect(isSuccess(StringType.validate((s as unknown) as any))).toBe(false)
  })
  it('Testing if  object is valid', () => {
    const StringType = t.string
    let s = {}
    expect(isSuccess(StringType.validate((s as unknown) as any))).toBe(false)
  })

  it('Testing if  array is valid', () => {
    const StringType = t.string
    let s: any = []
    expect(isSuccess(StringType.validate((s as unknown) as any))).toBe(false)
  })

  it('Testing if a function that takes no arguments and returns void is valid', () => {
    const StringType = t.string
    let s = () => {
      console.log('afgrg')
    }
    expect(isSuccess(StringType.validate((s as unknown) as any))).toBe(false)
  })

  it('Testing if a function that takes string argument and returns string is valid', () => {
    const StringType = t.string
    let s = (a: string) => {
      return a.toLowerCase()
    }
    expect(isSuccess(StringType.validate((s as unknown) as any))).toBe(false)
  })
  // failed test
  /*  it('Testing if never  is valid',()=>{
        const StringType=t.string;

        let s=function (): never {
            throw new Error();
        }
        expect(isSuccess(StringType.validate(s(),[]))).toBe(false);
    }) */

  it('Testing if enum value is valid', () => {
    const StringType = t.string
    enum color {
      Blue,
      Green
    }
    let s = color.Blue
    expect(isSuccess(StringType.validate((s as unknown) as any))).toBe(false)
  })
  it('Testing if enum is valid', () => {
    const StringType = t.string
    enum color {
      Blue,
      Green
    }

    expect(isSuccess(StringType.validate((color as unknown) as any))).toBe(false)
  })

  it('LengthTrue', () => {
    const StringLength5 = t.string.derive().length(5)
    let s = 'abcde'
    // let x=StringLength5.validate(s,[]);
    expect(isSuccess(StringLength5.validate(s))).toBe(true)
  })
  it('LengthFalse', () => {
    const StringLength5 = t.string.derive().length(5)
    let s = 'abcdef'
    expect(isSuccess(StringLength5.validate(s))).toBe(false)
  })
  it('MinLengthEquals', () => {
    const StringLength5 = t.string.derive().minLength(5)
    let s = 'abcde'
    expect(isSuccess(StringLength5.validate(s))).toBe(true)
  })
  it('MinLengthLonger', () => {
    const StringLength5 = t.string.derive().minLength(5)
    let s = 'abcddhthef'
    expect(isSuccess(StringLength5.validate(s))).toBe(true)
  })
  it('MinLengthShorter', () => {
    const StringLength5 = t.string.derive().minLength(5)
    let s = 'abcd'
    expect(isSuccess(StringLength5.validate(s))).toBe(false)
  })

  it('MaxLengthEquals', () => {
    const StringLength5 = t.string.derive().maxLength(5)
    let s = 'abcde'
    expect(isSuccess(StringLength5.validate(s))).toBe(true)
  })
  it('MaxLengthLonger', () => {
    const StringLength5 = t.string.derive().maxLength(5)
    let s = 'abcdef'
    expect(isSuccess(StringLength5.validate(s))).toBe(false)
  })
  it('MaxLengthShorter', () => {
    const StringLength5 = t.string.derive().maxLength(8)
    let s = 'abcd'
    expect(isSuccess(StringLength5.validate(s))).toBe(true)
  })
  it('MaxLength0', () => {
    const StringLength5 = t.string.derive('MaxLength0').maxLength(0)
    let s = ''
    expect(isSuccess(StringLength5.validate(s))).toBe(true)
  })
  it('MaxLength-1', () => {
    const StringLength5 = t.string.derive('MaxLength-1').maxLength(-1)
    let s = ''
    expect(isSuccess(StringLength5.validate(s))).toBe(false)
  })
  it('StartsWithSomeStringTrue1', () => {
    const StringStartingWithAbC = t.string.derive().startsWith('AbC')
    let s = 'AbC'
    expect(isSuccess(StringStartingWithAbC.validate(s))).toBe(true)
  })
  it('StartsWithSomeStringTrue2', () => {
    const StringStartingWithAbC = t.string.derive().startsWith('AbC')
    let s = 'AbCegr3'
    expect(isSuccess(StringStartingWithAbC.validate(s))).toBe(true)
  })
  it('StartsWithSomeStringFalse1', () => {
    const StringStartingWithAbC = t.string.derive().startsWith('AbC')
    let s = 'Abafrv'
    expect(isSuccess(StringStartingWithAbC.validate(s))).toBe(false)
  })

  it('StartsWithEmptyString', () => {
    const StringStartingWithAbC = t.string.derive('StartswithEmpty').startsWith('')
    let s = 'fgrgr'
    expect(isSuccess(StringStartingWithAbC.validate(s))).toBe(true)
  })

  it('EndssWithSomeStringTrue1', () => {
    const StringStartingWithAbC = t.string.derive().endsWith('AbC')
    let s = 'AbC'
    expect(isSuccess(StringStartingWithAbC.validate(s))).toBe(true)
  })
  it('EndsWithSomeStringTrue2', () => {
    const StringStartingWithAbC = t.string.derive().endsWith('AbC')
    let s = 'egrfeaAbC'
    expect(isSuccess(StringStartingWithAbC.validate(s))).toBe(true)
  })
  it('EndsWithSomeStringFalse1', () => {
    const StringStartingWithAbC = t.string.derive().endsWith('AbC')
    let s = 'rgabC'
    expect(isSuccess(StringStartingWithAbC.validate(s))).toBe(false)
  })

  it('EndsWithEmptyString', () => {
    const StringStartingWithAbC = t.string.derive('EndswithEmpty').endsWith('')
    let s = 'srgr'
    expect(isSuccess(StringStartingWithAbC.validate(s))).toBe(true)
  })

  it('IncludesSomeStringInTheMiddleTrue', () => {
    const StringType = t.string.derive().includes('avd')
    let s = 'efavdfev'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('IncludesSomeStringInTheMiddleFalse', () => {
    const StringType = t.string.derive().includes('avd')
    let s = 'efadfev'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('IncludesSomeStringAtTheBeginningTrue', () => {
    const StringType = t.string.derive().includes('avd')
    let s = 'avdfev'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('IncludesSomeStringAtTheBeginningFalse', () => {
    const StringType = t.string.derive().includes('avd')
    let s = 'avrrvr'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('IncludesSomeStringAtTheEndTrue', () => {
    const StringType = t.string.derive().includes('avd')
    let s = 'efgavd'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('IncludesSomeStringAtTheEndFalse', () => {
    const StringType = t.string.derive().includes('avd')
    let s = 'afgavr'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('IncludesEmptyString1', () => {
    const StringType = t.string.derive('INcludesEmpty').includes('')
    let s = 'afgavr'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('OneOfListHasOneElementTrue', () => {
    const StringType = t.string.derive().oneOf(['ae'])
    let s = 'ae'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('OneOfListHasOneElementFalse', () => {
    const StringType = t.string.derive().oneOf(['ae'])
    let s = 'ab'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('OneOfListHasMoreElementsTrue', () => {
    const StringType = t.string.derive().oneOf(['ae', 'ls'])
    let s = 'ls'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('OneOfListHasMoreElementsFalse', () => {
    const StringType = t.string.derive().oneOf(['ae', 'ls', 'ae', 'ls','ae', 'ls','ae', 'ls','ae', 'ls','ae', 'ls' ])
    let s = 'ab'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('WordTrue', () => {
    const StringType = t.string.derive().word
    let s = 'word'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('Word False 1 ', () => {
    const StringType = t.string.derive().word
    let s = 'a ansns d'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('Word False 2 ', () => {
    const StringType = t.string.derive().word
    let s = '123'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })

  it('EmptyTrue', () => {
    const StringType = t.string.derive().empty
    let s = ''
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('EmptyFalse', () => {
    const StringType = t.string.derive().empty
    let s = 'efge'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })

  it('NonEmptyTrue', () => {
    const StringType = t.string.derive().nonEmpty
    let s = 'safef'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('NonEmptyFalse', () => {
    const StringType = t.string.derive().nonEmpty
    let s = ''
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })

  it('EqualsTrue', () => {
    const StringType = t.string.derive().equals('afrg')
    let s = 'afrg'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('EqualsFalse', () => {
    const StringType = t.string.derive().equals('afr')
    let s = 'afrg'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })

  it('AlphnumericOnlyLetters', () => {
    const StringType = t.string.derive().alphanumeric
    let s = 'asfrgE'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('AlphnumericOnlyNumbers', () => {
    const StringType = t.string.derive().alphanumeric
    let s = '24464'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('AlphnumericMixed', () => {
    const StringType = t.string.derive().alphanumeric
    let s = '24efrg464'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('AlphnumericEmpty', () => {
    const StringType = t.string.derive().alphanumeric
    let s = ''
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('AlphnumericFalse', () => {
    const StringType = t.string.derive().alphanumeric
    let s = 'atg4+'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })

  it('AlphabeticalTrue', () => {
    const StringType = t.string.derive().alphabetical
    let s = 'afrAgr'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('AlphabeticalFalse', () => {
    const StringType = t.string.derive().alphabetical
    let s = 'afrA4gr'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })

  it('AlphnumericEmpty', () => {
    const StringType = t.string.derive().alphabetical
    let s = ''
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })

  it('NumericTrue', () => {
    const StringType = t.string.derive().numeric
    let s = '12345'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('NumericFalse', () => {
    const StringType = t.string.derive().numeric
    let s = 'afrA4gr'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })

  it('NumericEmpty', () => {
    const StringType = t.string.derive().numeric
    let s = ''
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('LowerTrue', () => {
    const StringType = t.string.derive().lowercase
    let s = 'dghg gd'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('LowerFalse', () => {
    const StringType = t.string.derive().lowercase
    let s = 'dghEfSg gd'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('LowerNumber', () => {
    const StringType = t.string.derive().lowercase
    let s = '345'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })

  it('UpperTrue', () => {
    const StringType = t.string.derive().uppercase
    let s = 'EGHR RGR'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('UpperFalse', () => {
    const StringType = t.string.derive().uppercase
    let s = 'Efge rggr'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('UpperNumber', () => {
    const StringType = t.string.derive().uppercase
    let s = '23'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('EmailTrue1', () => {
    const StringType = t.string.derive().email
    let s = 'abe@gmail.com'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('EmailTrue2', () => {
    const StringType = t.string.derive().email
    let s = 'abe@fon.bg.ac.rs'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('Email2@', () => {
    const StringType = t.string.derive().email
    let s = 'ab@e@fon.bg.ac.rs'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('EmailNo@', () => {
    const StringType = t.string.derive().email
    let s = 'abefon.bg.ac.rs'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('EmailNoPointsAfter@', () => {
    const StringType = t.string.derive().email
    let s = 'abe@gmailcom'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('EmailNothingAfterPoint', () => {
    const StringType = t.string.derive().email
    let s = 'abe@gmail.'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('EmailTooManyPoints', () => {
    const StringType = t.string.derive().email
    let s = 'abe@gmail.com.'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('EmailEmptyMail', () => {
    const StringType = t.string.derive().email
    let s = '@gmail.com.'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('EmailEmpty', () => {
    const StringType = t.string.derive().email
    let s = ''
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })

  it('EmailInvalidCharacter', () => {
    const StringType = t.string.derive().email
    let s = 'a;be@gmail.com'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('RegularExpressionTrue1', () => {
    const StringType = t.string.derive('bbb').matches(/b+/)
    let s = 'bbb'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('RegularExpressionTrue2', () => {
    const StringType = t.string.derive().matches(/^[b-s]*oi$/)
    let s = 'bbeoi'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('RegularExpressionTrue3', () => {
    const StringType = t.string.derive().matches(/^[b-s]*oi$/)
    let s = 'mrsoi'
    expect(isSuccess(StringType.validate(s))).toBe(true)
  })
  it('RegularExpressionFalse1', () => {
    const StringType = t.string.derive().matches(/^[b-s]*oi$/)
    let s = 'aoi'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('RegularExpressionFalse2', () => {
    const StringType = t.string.derive().matches(/^[b-s]*oi$/)
    let s = 'be1oi'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
  it('RegularExpressionFalse3', () => {
    const StringType = t.string.derive().matches(/^[b-s]*oi$/)
    let s = 'eber'
    expect(isSuccess(StringType.validate(s))).toBe(false)
  })
})
