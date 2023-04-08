// Constructor function
function Validator(options) {

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {}

    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorMess
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

        // Lấy ra các rule của selector
        var rules = selectorRules[rule.selector]

        // Lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng ktra
        for(var i = 0; i< rules.length; i++) {
            switch(inputElement.type) {
                case "checkbox":
                case "radio":
                    errorMess = rules[i](
                        formElement.querySelector(rule.selector + ":checked")
                    )
                    break;
                default: 
                errorMess = rules[i](inputElement.value)
            }
            
            if(errorMess) break;
        }

        if(errorMess) {
            errorElement.innerText = errorMess
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        }else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMess

    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    if(formElement) {
        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault()
            
            // console.log(options);
            var isFormValid = true
            // lặp qua từng rule và validate
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid) {
                    isFormValid = false
                }

            })

            

            if(isFormValid) {
                if(typeof options.onSubmit === 'function') {
                    var enableInput = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInput).reduce(function(values, input) {
                        
                        switch(input.type) {
                            case "radio":
                                values[input.name] = formElement.querySelector('input[name="' + input.name +'"]:checked').value
                                break;
                            case "checkbox": 
                                if(!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values;
                                }
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }

                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})
                    options.onSubmit(formValues)
                }else {
                    formElement.submit()
                }
            }

        }

        // Lặp qua mỗi rule và xử lý ( lắng nghe sự kiện blur, click)
        options.rules.forEach((rule) => {

            // Lưu lại các rule input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            }else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach((inputElement) => {
                // Xử lý khi blur khỏi ô input
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }
                
                // Xử lý khi người dùng nhập vào ô input
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
            
    
        })
    }
}


// Định nghĩa rules
// Nguyên tăc
// Khi lỗi ==> mess lỗi
// Không lỗi ==> undefined
Validator.isRequired = function(selector, mess) {
    return {
        selector,
        test: function(value) {
            return value ? undefined : mess || "Vui lòng nhập trường này"
        }
    }
}

Validator.isEmail = function(selector, mess) {

    return {
        selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : mess || "Trường này phải là Email"
        }
    }
}

Validator.minLength = function(selector, min, mess) {

    return {
        selector,
        test: function(value) {
            return value.length >= min ? undefined :mess ||`Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, mess) {
    return {
        selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : mess || "Giá trị nhập vào không chính xác"
        }
    }
}