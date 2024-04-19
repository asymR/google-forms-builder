(function() {
    'use strict';
    var formBuilderLib = {};
    formBuilderLib.load = function(targetId, assets, saveFormCallBack) {
        if (!assets.endsWith('/')) {
            assets = assets + '/';
        }
        var totalBuilderItems = 0;
        var totalInputBoxes = 0;
        if (document.getElementById(targetId)) {
            const response = initializeComponents();
            document.getElementById(targetId).appendChild(response);
        }
        document.addEventListener('DOMContentLoaded', () => {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.builder-input-box')) {
                    document.querySelectorAll('.builder-input-widget').forEach(element => {
                        document.querySelectorAll(".builder-input").forEach(element => {
                            makeMyBoxActive(element, "remove");
                        });
                        element.remove();
                    });
                }
            });
        });
        function createAlement(name = "div", attributes=[], classes=[]) {
            const element = document.createElement(name);
            attributes.forEach(attribute => {
                element.setAttribute(attribute.name, attribute.value);
            });
            classes.forEach(cls => {
                element.classList.add(cls);
            });
            return element;
        }
        function createInput(parentItem, params) {
            totalInputBoxes++;
            const inputBox = createAlement("div", [{
                name: "data-builder-input-box",
                value: (totalInputBoxes + 1)
            }], ["builder-input-box"]);
            const input = createAlement("div", [{
                name: "contenteditable",
                value: true
            }], ["builder-input"]);
            if(params.text){
                input.innerHTML = params.text;
            }
            if(params.placeholder){
                input.setAttribute("placeholder", params.placeholder);
            }
            if(params.fontSize){
                input.style.fontSize = params.fontSize;
            }
            if(params.color){
                input.style.color = params.color;
            }
            if(params.backgroundColor){
                input.style.backgroundColor = params.backgroundColor;
            }
            if(params.padding){
                input.style.padding = params.padding;
            }
            if(params.name){
                input.setAttribute("name", params.name);
            }
            if(params.value){
                input.innerHTML = params.value;
            }
            if(params.classes){
                params.classes.forEach(className => {
                    input.classList.add(className);
                });
            }
            input.addEventListener("focusin", function(event) {
                showWidgetAfterInput(this, event);
                makeMyBoxActive(this, "add");
            });
            input.addEventListener("click", function(event) {
                showWidgetAfterInput(this, event);
                floatingInTheInput();
            });
            input.addEventListener("keydown", function() {
                floatingInTheInput();
            });
            input.addEventListener("keypress", function() {
                floatingInTheInput();
            });
            input.addEventListener('input', function(e) {
                preventTextFromStyling(e);
            });
            input.addEventListener('paste', function(e) {
                preventTextFromStyling(e);
            });
            inputBox.appendChild(input);
            parentItem.appendChild(inputBox);
            return parentItem;
        }
        function preventTextFromStyling(e) {
            try {
                e.preventDefault();
                const text = (e.originalEvent || e).clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            } catch (error) { }
        }
        function makeMyBoxActive(input, type) {
            if(type == "add"){
                input.closest(".builder-item").classList.add("active");
            }else{
                input.closest(".builder-item").classList.remove("active");
            }
        }
        function createFooterButton(iconSrc, title, eventType){
            const button = createAlement("button", [], ["footer-button"]);
            const icon = createAlement("img", [], ["footer-button-icon", eventType]);
            icon.setAttribute("src", `${assets}images/${iconSrc}`);
            button.appendChild(icon);
            button.setAttribute("title", title);
            button.addEventListener("click", () => {
                document.getElementById("builder-item-box").appendChild(createFormComponent(eventType, true, true));
            });
            return button;
        };
        function getFooterBox() {
            const footerBox = createAlement("div", [{
                name: "id",
                value: "form-builder-footer-box"
            }]);
            const footerAddTitleDescription = createFooterButton("add-title-and-desc.png", "Add title and description", "add-title-and-description");
            const multipleChoice = createFooterButton("add-question.png", "Add multiple choice", "add-multiple-choice");
            const questionAnswer = createFooterButton("question-answer.png", "Add question answer", "add-question-answer");
            footerBox.appendChild(questionAnswer);
            footerBox.appendChild(multipleChoice);
            footerBox.appendChild(footerAddTitleDescription);
            return footerBox;
        }
        var draggableBuilderItem = null;
        function builderItem(allClasses=[], drag) {
            totalBuilderItems++;
            allClasses.push("builder-item");
            const item = createAlement("div", [], allClasses);
            item.setAttribute("data-id", totalBuilderItems);
            if(drag){
                item.setAttribute("draggable", true);
                item.addEventListener("dragstart", function (event) {
                    draggableBuilderItem = event.target;
                    draggableBuilderItem.classList.add('dragging');
                });
                item.addEventListener("dragover", function (event) {
                    event.preventDefault();
                    if(!draggableBuilderItem){ return false; }
                });
                item.addEventListener("drop", function (event) {
                    event.preventDefault();
                    if(!draggableBuilderItem){ return false; }
                    itemDrop(event);
                });
                item.addEventListener("dragend", function (event) {
                    if(!draggableBuilderItem){ return false; }
                    draggableBuilderItem.classList.remove('dragging');
                    draggableBuilderItem = null;
                });
            }
            return item;
        }
        function itemDrop(event) {
            try {
                let container = null;
                let draggableElements = null;
                if(event.target.classList.contains('qa-item-option-element') == true){
                    container = event.target.closest(".qa-option-main-box");
                    draggableElements = [...container.querySelectorAll('.qa-option-box:not(.dragging)')];
                }else{
                    container = document.getElementById('builder-item-box');
                    draggableElements = [...container.querySelectorAll('.builder-item:not(.dragging)')];
                }
                let dragging = document.querySelector('.dragging');
                let afterElement = getDragAfterElement(draggableElements, event.clientY);
                if(afterElement.classList.contains('qa-option-box') == false && dragging.classList.contains('qa-item-option-element') == true){
                    return false;
                }
                if(afterElement.classList.contains('builder-item') == false && dragging.classList.contains('builder-item') == true){
                    return false;
                }
                container.insertBefore(dragging, afterElement);
            } catch (error) { }
        }
        function getDragAfterElement(draggableElements, y) {
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
        function getDragger() {
            const draggerBox = createAlement("div", [], ["dragger", "unselectable"]);
            return draggerBox;
        }
        function createFormComponent(type, drag = true, footer=false) {
            let allClasses = [];
            const basicFontSize = "12pt";
            if(type == "form-title"){
                allClasses = ["title-box"];
            }
            allClasses.push(type);
            const item = builderItem(allClasses, drag);
            if(drag){
                const dragger = getDragger();
                item.prepend(dragger);
            }
            if(type == "add-title-and-description"){
                createInput(item, {
                    text : "Untitled Title",
                    placeholder : "Title",
                    fontSize : "16pt",
                    color: "#000",
                    classes: ["title"]
                });
                createInput(item, {
                    text : "",
                    placeholder : "Description (optional)",
                    fontSize : basicFontSize,
                    color: "#717171",
                    classes: ["desc"]
                });
            }
            if(type == "form-title"){
                createInput(item, {
                    text : "Untitled form",
                    placeholder : "Form title",
                    fontSize : "24pt",
                    color: "#000",
                    name: "form-title"
                });
                createInput(item, {
                    text : "",
                    placeholder : "Form description",
                    fontSize : basicFontSize,
                    color: "#717171",
                    name: "form-desc"
                });
            }
            if(type == "add-multiple-choice"){
                const multipleChoiceBox = createMultipleChoiceComponent();
                item.appendChild(multipleChoiceBox);
            }
            if(type == "add-question-answer"){
                const answerQuestionBox = createanswerQuestionComponent();
                item.appendChild(answerQuestionBox);
            }
            if(footer){
                const footerOptions = {};
                if(type == "add-title-and-description" || type == "add-multiple-choice" || type == "add-question-answer"){
                    footerOptions.delete = true;
                }
                if(type == "add-multiple-choice" || type == "add-question-answer"){
                    footerOptions.required = true;
                }
                if(!isObjEmpty(footerOptions)){
                    const footer = componentFooter(footerOptions);
                    item.appendChild(footer);
                }
            }
            return item;
        }
        function isObjEmpty (obj) {
            return Object.values(obj).length === 0 && obj.constructor === Object;
        }
        function createMultipleChoiceComponent() {
            const box = createAlement("div");
            const commonInputBox = createQAInputBox();
            box.appendChild(commonInputBox);
            const optionsMainBox = createAlement("div");
            optionsMainBox.classList.add("qa-option-main-box");
            const optionsBox = createQAOptionsBox(1);
            optionsMainBox.appendChild(optionsBox);
            const addQaOptionButton = addQaOptionButtonBox();
            optionsMainBox.appendChild(addQaOptionButton);
            box.appendChild(optionsMainBox);
            return box;
        }
        function addQaOptionButtonBox() {
            const addOptionBox = createAlement("div", [], ["add-qa-option-box"]);
            const optionBeforeImg = createAlement("img", [{
                name: "src",
                value: `${assets}images/circle.png`
            }], ["qa-option-image"]);
            addOptionBox.appendChild(optionBeforeImg);
            const addOptionButton = createAlement("div", [], ["add-qa-option-button"]);
            addOptionButton.innerHTML = 'Add Option';
            addOptionButton.addEventListener("click", function () {
                const currentOptions = this.parentElement.parentElement.querySelectorAll(".qa-option-box");
                const optionsBox = createQAOptionsBox(currentOptions.length + 1);
                if(currentOptions.length > 0){
                    currentOptions[currentOptions.length - 1].after(optionsBox);
                }else{
                    this.parentElement.before(optionsBox);
                }
                optionsBox.querySelector(".qa-option-input").focus();
            });
            addOptionBox.appendChild(addOptionButton);
            return addOptionBox;
        }
        function createanswerQuestionComponent() {
            const box = createAlement("div");
            const commonInputBox = createQAInputBox();
            box.appendChild(commonInputBox);
            const qaMainBox = createAlement("div");
            qaMainBox.classList.add("qa-main-box");
            const qaMainBoxText = createAlement("span", [], ["qa-main-box-title"]);
            qaMainBoxText.innerHTML = 'Short answer text';
            qaMainBox.appendChild(qaMainBoxText);
            let qaToggleSwitch = toggleSwitch("Paragraph", function (event) {
                if(event.target.classList.contains("active")){
                    qaMainBoxText.innerHTML = "Long answer text";
                }else{
                    qaMainBoxText.innerHTML = "Short answer text";
                }
            });
            qaMainBox.appendChild(qaToggleSwitch);
            box.appendChild(qaMainBox);
            return box;
        }
        var draggableQAOptionItem = null;
        function createQAOptionsBox(number=1) {
            const optionBox = createAlement("div", [], ["qa-option-box", "qa-item-option-element"]);
            optionBox.setAttribute("draggable", true);
            optionBox.addEventListener("dragstart", function (event) {
                draggableQAOptionItem = event.target;
                draggableQAOptionItem.classList.add('dragging');
            });
            optionBox.addEventListener("dragover", function (event) {
                event.preventDefault();
                if(!draggableQAOptionItem){ return false; }
            });
            optionBox.addEventListener("drop", function (event) {
                event.preventDefault();
                if(!draggableQAOptionItem){ return false; }
                itemDrop(event);
            });
            optionBox.addEventListener("dragend", function (event) {
                if(!draggableQAOptionItem){ return false; }
                draggableQAOptionItem.classList.remove('dragging');
                draggableQAOptionItem = null;
            });
            const preOptionBeforeImg = createAlement("img", [{
                name: "src",
                value: `${assets}images/drag.png`
            }], ["qa-option-darg-image", "qa-item-option-element", "unselectable"]);
            optionBox.appendChild(preOptionBeforeImg);
            const optionBeforeImg = createAlement("img", [{
                name: "src",
                value: `${assets}images/circle.png`
            }], ["qa-option-image", "qa-item-option-element"]);
            optionBox.appendChild(optionBeforeImg);
            const optionInput = createAlement("input", [{
                name: "value",
                value: "Option"+number
            }], ["qa-option-input", "qa-item-option-element"]);
            optionBox.appendChild(optionInput);
            const optionAfterImg = createAlement("img", [{
                name: "src",
                value: `${assets}images/close.png`
            }], ["qa-option-close-image", "qa-item-option-element"]);
            optionAfterImg.addEventListener("click", function(event){
                if(this.parentElement.parentElement.querySelectorAll(".qa-option-box").length > 1){
                    this.parentElement.remove();
                }else{
                    this.parentElement.querySelector("input").value = "Option1";
                }
            });
            optionBox.appendChild(optionAfterImg);
            return optionBox;
        }
        function createQAInputBox() {
            const inputMainBox = createAlement("div");
            const inputBox = createAlement("div");
            createInput(inputBox, {
                text : "",
                placeholder : "Question",
                fontSize : "14pt",
                color: "#000",
                backgroundColor: "#00000012",
                padding: "10px",
                classes: ["question"],
                value: "Untitled Question"
            });
            inputMainBox.appendChild(inputBox);
            return inputMainBox;
        }
        function componentFooter(showButtons = {}) {
            if(isObjEmpty(showButtons)){
                return null;
            }
            const footer = createAlement("div", [], ["component-footer-box"]);
            if(showButtons.delete){
                const deleteButton = createAlement("img", [{
                    name: "src",
                    value: `${assets}images/delete.png`
                }]);
                deleteButton.addEventListener("click", function () {
                    this.closest(".builder-item").remove();
                });
                footer.appendChild(deleteButton);
            }
            if(showButtons.required){
                if(Object.keys(showButtons).length > 1){
                    let divider = createAlement("div", [], ["divider"]);
                    footer.appendChild(divider);
                }
                footer.appendChild(toggleSwitch("Required"));
            }
            return footer;
        }
        function randomIdGenerator() {
            const S4 = function() {
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            };
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        }
        function toggleSwitch(title, callBack=null) {
            const id = randomIdGenerator();
            const switchContainer = createAlement("label", [{
                name: "for",
                value: id
            }], ["switch-container"]);
            const toggleContainer = createAlement("div", [], ["toggle-container"]);
            const input = createAlement("input", [{
                name: "id",
                value: id
            },{
                name: "type",
                value: "checkbox"
            },{
                name: "role",
                value: "switch"
            },{
                name: "aria-labelledby",
                value: "switch-label"
            }]);
            input.addEventListener("change", function (event) {
                if(input.classList.contains("active")){
                    input.classList.remove("active");
                }else{
                    input.classList.add("active");
                }
                if(callBack != null){
                    callBack(event);
                }
            });
            toggleContainer.appendChild(input);
            const slider = createAlement("span", [], ["slider"]);
            toggleContainer.appendChild(slider);
            switchContainer.appendChild(toggleContainer);
            const toggleStatus = createAlement("span", [{
                name: "aria-hidden",
                value: true
            }], ["toggle-status"]);
            toggleStatus.innerHTML = title;
            switchContainer.appendChild(toggleStatus);
            return switchContainer;
        }
        function widgetButtonComponent(widget, input, title, icon, type) {
            const builderInput = input.querySelector(".builder-input");
            const button = createAlement("button", [{
                name: "title",
                value: title
            },{
                name: "id",
                value: "builder-widget-button-"+type
            }], ["tooltip"])
            button.innerHTML = icon;
            button.addEventListener("click", function() {
                button.classList.add("active");
                replaceSelectedTextWithTag(builderInput, type);
                floatingInTheInput(builderInput);
            });
            widget.appendChild(button);
        }
        function replaceSelectedTextWithTag(input, tag) {
            try {
                if(tag == "bold"){
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand('bold', false, null);
                }
                if(tag == "italic"){
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand('italic', false, null);
                }
                if(tag == "underline"){
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand('underline', false, null);
                }
                if(tag == "link"){
                    const url = prompt('Enter URL:');
                    if (url) {
                        document.execCommand('createLink', false, url);
                    }
                }
                if (tag == "clear") {
                    input.innerHTML = input.innerText;
                }
                input.focus();
            } catch (error) { }
        }
        function floatingInTheInput() {
            try {
                const selection = window.getSelection();
                const selectedParentNode = selection.focusNode.parentElement;
                const boldButton = document.getElementById("builder-widget-button-bold");
                const italicButton = document.getElementById("builder-widget-button-italic");
                const underlineButton = document.getElementById("builder-widget-button-underline");
                const linkButton = document.getElementById("builder-widget-button-link");
                const parentNodes = [selectedParentNode];
                if(selectedParentNode.tagName == "A" && selectedParentNode.parentElement.tagName == "SPAN"){
                    parentNodes = [selectedParentNode, selectedParentNode.parentElement];
                }
                if(selectedParentNode.tagName == "U" && selectedParentNode.parentElement.tagName == "I"){
                    parentNodes = [selectedParentNode, selectedParentNode.parentElement, selectedParentNode.parentElement.parentElement];
                }
                let hasBold = false;
                let hasItalic = false;
                let hasUnderlined = false;
                let hasLink = false;
                for (let index = 0; index < parentNodes.length; index++) {
                    if(parentNodes[index].style.fontWeight === 'bold' || parentNodes[index].tagName == "B"){
                        hasBold = true;
                    }
                    if(parentNodes[index].style.fontStyle === 'italic' || parentNodes[index].tagName == "I"){
                        hasItalic = true;
                    }
                    if(parentNodes[index].style.textDecorationLine === 'underline' || parentNodes[index].tagName == "U"){
                        hasUnderlined = true;
                    }
                    if(parentNodes[index].tagName == "A"){
                        hasLink = true;
                    }
                }
                boldButton.classList.remove("active");
                italicButton.classList.remove("active");
                underlineButton.classList.remove("active");
                linkButton.classList.remove("active");
                if(hasBold){
                    boldButton.classList.add("active");
                }
                if(hasItalic){
                    italicButton.classList.add("active");
                }
                if(hasUnderlined){
                    underlineButton.classList.add("active");
                }
                if(hasLink){
                    linkButton.classList.add("active");
                }
            } catch (error) {
                
            }
        }
        function showWidgetAfterInput(input, event) {
            document.querySelectorAll(".builder-input").forEach(element => {
                const myBox = element.closest(".builder-input-box");
                if(myBox.getAttribute("data-builder-input-box") !== event.target.closest(".builder-input-box").getAttribute("data-builder-input-box")){
                    if(myBox.querySelector(".builder-input-widget")){
                        myBox.querySelector(".builder-input-widget").remove();
                    }
                }
            });
            const inputBox = input.closest(".builder-input-box");
            const widget = inputBox.querySelector(".builder-input-widget");
            if(!widget) {
                const newWidget = createAlement("div", [], ["builder-input-widget"]);
                widgetButtonComponent(newWidget, inputBox, 'Bold', `<img src="${assets}images/bold.png" />`, "bold");
                widgetButtonComponent(newWidget, inputBox, 'Italic', `<img src="${assets}images/italic.png" />`, "italic");
                widgetButtonComponent(newWidget, inputBox, 'Underline', `<img src="${assets}images/underline.png" />`, "underline");
                widgetButtonComponent(newWidget, inputBox, 'Link', `<img src="${assets}images/link.png" />`, "link");
                widgetButtonComponent(newWidget, inputBox, 'Clear formatting', `<img src="${assets}images/clear.png" />`, "clear");
                inputBox.appendChild(newWidget);
            }
        }
        function initializeComponents() {
            const mainBox = createAlement("div", [], ["form-builder-main-box"]);
            const formTitle = createFormComponent("form-title", false);
            mainBox.appendChild(formTitle);
            const builderItemBox = createAlement("div", [{
                name: "id",
                value: "builder-item-box"
            }]);
            mainBox.append(builderItemBox);
            const footerMainBox = createAlement("div", [{
                name: "id",
                value: "builder-footer-main-box"
            }]);
            const footerBox = getFooterBox();
            footerMainBox.appendChild(footerBox);
            const saveFormBox = getSaveFormBox();
            footerMainBox.appendChild(saveFormBox);
            mainBox.appendChild(footerMainBox);
            return mainBox;
        }
        function getSaveFormBox() {
            const mainBox = createAlement("div", [{
                name: "id",
                value: "form-builder-save-button-box"
            }]);
            const saveButton = createAlement("button", [{
                name: "id",
                value: "form-builder-save-button"
            }]);
            saveButton.innerHTML = "Preview";
            saveButton.addEventListener("click", function (event) {
                let data = saveFormData();
                saveFormCallBack(data);
            });
            mainBox.appendChild(saveButton);
            return mainBox;
        }
        function saveFormData() {
            const mainResultBox = createAlement("div", [], ["form-builder-main-box"]);
            const formTitleParentBox = document.querySelector("div[name=form-title]").parentElement.parentElement.cloneNode(true);
            formTitleParentBox.querySelectorAll("div").forEach(element => {
                element.removeAttribute("contenteditable");
                if(element.classList.contains("builder-input")){
                    if(element.innerHTML.trim() == ""){
                        element.parentElement.remove();
                    }else{
                        element.parentElement.parentElement.classList.remove("active");
                        element.classList.remove("builder-input");
                        element.classList.remove("view-builder-input");
                        element.removeAttribute("placeholder");
                        element.parentElement.style.margin = "unset";
                    }
                }
            });
            mainResultBox.appendChild(formTitleParentBox);
            var builderItemBox = createAlement("div", [{
                "name": "id",
                "value" : "builder-item-box"
            }]);
            let countItem = 0;
            document.getElementById("builder-item-box").querySelectorAll(".builder-item").forEach(element => {
                let builderItem = element.cloneNode(true);
                builderItem.removeAttribute("draggable");
                countItem++;
                let countOptions = 0;
                builderItem.querySelectorAll("div").forEach(innerElement => {
                    if(innerElement.innerHTML.trim() == "" && innerElement.classList.contains("builder-input")){
                        innerElement.parentElement.remove();
                    }else if(innerElement.classList.contains("dragger") || innerElement.classList.contains("component-footer-box") || innerElement.classList.contains("add-qa-option-box")){
                        innerElement.remove();
                    }else{
                        innerElement.removeAttribute("draggable");
                        innerElement.classList.remove("unselectable");
                        innerElement.removeAttribute("contenteditable");
                        if(innerElement.classList.contains("builder-input")){
                            innerElement.parentElement.parentElement.classList.remove("active");
                            innerElement.classList.remove("builder-input");
                            innerElement.classList.remove("view-builder-input");
                            innerElement.removeAttribute("placeholder");
                            innerElement.parentElement.style.margin = "unset";
                            innerElement.style.backgroundColor = "unset";
                            innerElement.style.padding = "unset";
                            if(innerElement.classList.contains("question")){
                                innerElement.style.marginBottom = "1rem";
                            }
                        }
                        if(innerElement.classList.contains("qa-option-box")){
                            countOptions++;
                            let optionLabel = innerElement.querySelector(".qa-option-input").value;
                            let optionId = countItem + "" + countOptions + "option";
                            let optionName = countItem + "option";
                            let optionBox = createAlement("label", [{
                                name: "for",
                                value: optionId
                            }]);
                            optionBox.innerHTML = optionLabel;
                            let radioOption = createAlement("input", [{
                                name: "type",
                                value: "radio"
                            },{
                                name: "value",
                                value: countOptions
                            },{
                                name: "id",
                                value: optionId
                            },{
                                name: "name",
                                value: optionName
                            }],["qa-radio-option"]);
                            innerElement.classList.add("qa-radio-box");
                            innerElement.innerHTML = "";
                            innerElement.appendChild(radioOption);
                            innerElement.appendChild(optionBox);
                        }
                        if(innerElement.classList.contains("qa-main-box")){
                            let answerType = innerElement.querySelector(".qa-main-box-title").innerHTML;
                            let questionInput = null;
                            if(answerType == "Short answer text"){
                                questionInput = createAlement("input", [{
                                    name: "placeholder",
                                    value: "Your answer"
                                }], ["qa-main-box-input"]);
                            }else{
                                questionInput = createAlement("textarea", [{
                                    name: "placeholder",
                                    value: "Your answer"
                                }], ["qa-main-box-input"]);
                            }
                            innerElement.innerHTML = "";
                            innerElement.appendChild(questionInput);
                        }
                    }
                });
                let optionCheckBox = element.querySelector(".component-footer-box").querySelector("input");
                if(optionCheckBox && optionCheckBox.classList.contains("active")){
                    builderItem.setAttribute("data-required", "required");
                    builderItem.querySelector(".question").innerHTML = builderItem.querySelector(".question").innerHTML + '<span class="required">*<span>';
                }
                builderItemBox.appendChild(builderItem);
            });
            mainResultBox.appendChild(builderItemBox);
            return mainResultBox;
        }
    }
    window.formBuilderLib = formBuilderLib;
})();