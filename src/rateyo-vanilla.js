/*****
* rateYo - v1.2.2
* http://prrashi.github.io/rateyo/
* Copyright (c) 2014 Prashanth Pamidi; Licensed MIT
*****/



/*****
* WORK IN PROGRESS
* THIS VANILLA VERSION OF THE PLUGIN IS INCOMPLETE
* DO NOT USE THIS IN PROJECTS
*****/



;(function (document) {
  
  /* The basic svg string required to generate stars
   */
  var BASICSTAR = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"+
                  "<svg version=\"1.1\" id=\"Layer_1\""+
                        "xmlns=\"http://www.w3.org/2000/svg\""+
                        "viewBox=\"0 12.705 512 486.59\""+
                        "x=\"0px\" y=\"0px\""+
                        "xml:space=\"preserve\">"+
                    "<polygon id=\"star-icon\""+
                              "points=\"256.814,12.705 317.205,198.566"+
                                      " 512.631,198.566 354.529,313.435 "+
                                      "414.918,499.295 256.814,384.427 "+
                                      "98.713,499.295 159.102,313.435 "+
                                      "1,198.566 196.426,198.566 \"/>"+
                  "</svg>";

  var DEFAULTS = {

    starWidth: "32px",
    normalFill: "gray",
    ratedFill: "#f39c12",
    numStars: 5,
    minValue: 0,
    maxValue: 5,
    precision: 1,
    rating: 0,
    fullStar: false,
    halfStar: false,
    readOnly: false,
    onChange: null,
    onSet: null
  };

  /* Utilities */
  function isDefined(value) {

    return typeof value !== "undefined";
  }

  function each(collection, callback) {
  
    var key, item, result;

    if (!isDefined(collection)) {
    
      return collection;  
    }

    if (!isDefined(callback) || typeof callback !== "function") {
    
      return collection;  
    }

    for (key in collection) {
    
      if (!collection.hasOwnProperty(key)) {
      
        continue;  
      }

      item = collection[key];

      result = callback.apply(item, [key, item]);

      if (typeof result === "boolean" && result.toString() === "false") {
      
        break;  
      }
    }

    return collection;
  }

  function getOffset(elem) {

    var docElem, doc,
        offset = {top: 0, left: 0};

    if (!elem) {

      return offset;
    }

    doc = elem.ownerDocument;
    docElem = doc.documentElement;

    if (isDefined(elem.getBoundingClientRect)) {

      var box = elem.getBoundingClientRect();

      offset.top = box.top;
      offset.left = boz.left;
    }

    offset.top += window.pageYOffset - docElem.clientTop;
    offset.left += window.pageXOffset - docElem.clientLeft;

    return offset;
  }

  function getStyle(el, name) {

    var styles = window.getComputedStyle(el);

    return styles.getPropertyValue(name) || styles[name];
  }

  /* End Utitlities */

  function checkPrecision (value, minValue, maxValue) {

    /* its like comparing 0.00 with 0 which is true*/
    if (value === minValue) {

      value = minValue;
    }
    else if(value === maxValue) {

      value = maxValue;
    }

    return value;
  }

  function checkBounds (value, minValue, maxValue) {

    var isValid = value >= minValue && value <= maxValue;

    if(!isValid){

        throw Error("Invalid Rating, expected value between "+ minValue +
                    " and " + maxValue);
    }

    return value;
  }

  function getInstance (node, collection) {

    var instance;

    each(collection, function () {

      if(node === this.node){

        instance = this;
        return false;
      }
    });

    return instance;
  }

  function deleteInstance (node, collection) {

    each(collection, function (index) {

      if (node === this.node) {

        var firstPart = collection.slice(0, index),
            secondPart = collection.slice(index+1, collection.length);

        collection = firstPart.concat(secondPart);

        return false;
      }
    });

    return collection;
  }

  var parser;

  try { 

    parser = new DOMParser();
  }catch() {

    throw new Error("SVG Parser not found!");
  }

  function RateYo (node, options) {

    this.node = node;

    var that = this;

    var className = node.className;
    
    node.className = (className.length > 0?" ":"") + "jq-ry-container";

    var groupWrapper = document.createElement("div");
    groupWrapper.className = "jq-ry-group-wrapper";
    node.appendChild(groupWrapper);

    var normalGroup = document.createElement("div");
    normalGroup.className = "jq-ry-normal-group jq-ry-group";
    groupWrapper.appendChild(normalGroup);

    var ratedGroup = document.createElement("div");
    ratedGroup.className = "jq-ry-rated-group jq-ry-group";
    groupWrapper.appendChild(ratedGroup);

    function showRating (ratingVal) {

      if(!isDefined(ratingVal)){

        ratingVal = options.rating;
      }

      var minValue = options.minValue,
          maxValue = options.maxValue;

      var percent = ((ratingVal - minValue)/(maxValue - minValue))*100;

      ratedGroup.style.width = percent + "%";
    }

    function setStarWidth (newWidth) {

      if (!isDefined(newWidth)) {

        return options.starWidth;
      }

      // In the current version, the width and height of the star
      // should be the same
      options.starWidth = options.starHeight = newWidth;

      var containerWidth = parseInt(options.starWidth.replace("px","").trim());

      containerWidth = containerWidth*options.numStars;

      node.style.width = containerWidth + "px";

      var svg = normalGroup.querySelector("svg");
      svg.setAttribute("width", options.starWidth);
      svg.setAttribute("height", options.starHeight);

      svg = ratedGroup.querySelector("svg");
      svg.setAttribute("width", options.starWidth);
      svg.setAttribute("height", options.starHeight);

      return node;
    }

    function setNormalFill (newFill) {

      if (!isDefined(newFill)) {

        return options.normalFill;
      }

      options.normalFill = newFill;

      var svg = normalGroup.querySelector("svg");
      svg.attr("fill", options.normalFill);

      return node;
    }

    function setRatedFill (newFill) {

      if (!isDefined(newFill)) {

        return options.ratedFill;
      }

      options.ratedFill = newFill;

      var svg = ratedGroup.find("svg");
      svg.setAttribute("fill", options.ratedFill);

      return node;
    }

    function setNumStars (newValue) {

      if (!isDefined(newValue)) {

        return options.numStars;
      }

      options.numStars = newValue;

      normalGroup.innerHTML = "";
      ratedGroup.innerHTML = "";

      var star;

      for (var i=0; i<options.numStars; i++) {

        star = parser.parseFromString(BASICSTAR, "image/svg+xml");
        normalGroup.appendChild(star);

        star = parser.parseFromString(BASICSTAR, "image/svg+xml");
        ratedGroup.appendChild(star);
      }

      setStarWidth(options.starWidth);
      setRatedFill(options.ratedFill);
      setNormalFill(options.normalFill);

      showRating();

      return node;
    }

    function setMinValue (newValue) {

      if (!isDefined(newValue)) {

        return options.minValue;
      }

      options.minValue = newValue;

      showRating();

      return node;
    }

    function setMaxValue (newValue) {

      if (!isDefined(newValue)) {

        return options.maxValue;
      }

      options.maxValue = newValue;

      showRating();

      return node;
    }

    function setPrecision (newValue) {

      if (!isDefined(newValue)) {

        return options.precision;
      }

      options.precision = newValue;

      showRating();

      return node;
    }

    function setHalfStar (newValue) {

      if (!isDefined(newValue)) {
      
        return options.halfStar;  
      }

      options.halfStar = newValue;

      return node;
    }

    function setFullStar (newValue) {
    
      if (!isDefined(newValue))   {
      
        return options.fullStar;  
      }

      options.fullStar = newValue;

      return node;
    }

    function calculateRating (e) {

      var position = getOffset(normalGroup),
          nodeStartX = position.left,
          width = getStyle(normalGroup, "width").replace("px", "");

      width = parseInt(width);

      var nodeEndX = nodeStartX + width;

      var minValue = options.minValue,
          maxValue = options.maxValue;

      var pageX = e.clientX + window.pageXOffset;

      var calculatedRating;

      if(pageX < nodeStartX) {

        calculatedRating = minValue;
      }else if (pageX > nodeEndX) {

        calculatedRating = maxValue;
      }else {

        calculatedRating = ((pageX - nodeStartX)/(nodeEndX - nodeStartX));
        calculatedRating *= (maxValue - minValue);
        calculatedRating += minValue;
      }

      if (options.halfStar) {

        if (calculatedRating > (Math.ceil(calculatedRating) - 0.5)) {

          calculatedRating = Math.ceil(calculatedRating);
        }else {

          calculatedRating = Math.ceil(calculatedRating) - 0.5;
        }
      }

      if (options.fullStar) {

        calculatedRating = Math.ceil(calculatedRating);
      }

      return calculatedRating;
    }

    function onMouseEnter (e) {

      var rating = calculateRating(e).toFixed(options.precision);

      var minValue = options.minValue,
          maxValue = options.maxValue;

      rating = checkPrecision(parseFloat(rating), minValue, maxValue);

      showRating(rating);

      $node.trigger("rateyo.change", {rating: rating});
    }

    function onMouseLeave () {

      showRating();

      $node.trigger("rateyo.change", {rating: options.rating});
    }

    function onMouseClick (e) {

      var resultantRating = calculateRating(e).toFixed(options.precision);
      resultantRating = parseFloat(resultantRating);

      that.rating(resultantRating);
    }

    function onChange (e, data) {

      if(options.onChange && typeof options.onChange === "function") {

        /* jshint validthis:true */
        options.onChange.apply(this, [data.rating, that]);
      }
    }

    function onSet (e, data) {

      if(options.onSet && typeof options.onSet === "function") {

        /* jshint validthis:true */
        options.onSet.apply(this, [data.rating, that]);
      }
    }

    function bindEvents () {

      $node.on("mousemove", onMouseEnter)
           .on("mouseenter", onMouseEnter)
           .on("mouseleave", onMouseLeave)
           .on("click", onMouseClick)
           .on("rateyo.change", onChange)
           .on("rateyo.set", onSet);
    }

    function unbindEvents () {

      $node.off("mousemove", onMouseEnter)
           .off("mouseenter", onMouseEnter)
           .off("mouseleave", onMouseLeave)
           .off("click", onMouseClick)
           .off("rateyo.change", onChange)
           .off("rateyo.set", onSet);
    }

    function setReadOnly (newValue) {

      if (!isDefined(newValue)) {

        return options.readOnly;
      }

      options.readOnly = newValue;

      $node.attr("readonly", true);

      unbindEvents();

      if (!newValue) {

        $node.removeAttr("readonly");

        bindEvents();
      }

      return $node;
    }

    function setRating (newValue) {

      if (!isDefined(newValue)) {

        return options.rating;
      }

      var rating = newValue;

      var maxValue = options.maxValue,
          minValue = options.minValue;

      if (typeof rating === "string") {

        if (rating[rating.length - 1] === "%") {

          rating = rating.substr(0, rating.length - 1);
          maxValue = 100;
          minValue = 0;

          setMaxValue(maxValue);
          setMinValue(minValue);
        }

        rating = parseFloat(rating);
      }

      checkBounds(rating, minValue, maxValue);

      rating = parseFloat(rating.toFixed(options.precision));

      checkPrecision(parseFloat(rating), minValue, maxValue);

      options.rating = rating;

      showRating();

      $node.trigger("rateyo.set", {rating: rating});

      return $node;
    }

    function setOnSet (method) {

      if (!isDefined(method)) {

        return options.onSet;
      }

      options.onSet = method;

      return $node;
    }

    function setOnChange (method) {

      if (!isDefined(method)) {

        return options.onChange;
      }

      options.onChange = method;

      return $node;
    }

    this.rating = function (newValue) {

      if (!isDefined(newValue)) {

        return options.rating;
      }

      setRating(newValue);

      return $node;
    };

    this.destroy = function () {

      if (!options.readOnly) {
        unbindEvents();
      }

      RateYo.prototype.collection = deleteInstance($node.get(0),
                                                   this.collection);

      $node.removeClass("jq-ry-container").children().remove();

      return $node;
    };

    this.method = function (methodName) {

      if (!methodName) {

        throw Error("Method name not specified!");
      }

      if (!isDefined(this[methodName])) {

        throw Error("Method " + methodName + " doesn't exist!");
      }

      var args = Array.prototype.slice.apply(arguments, []),
          params = args.slice(1),
          method = this[methodName];

      return method.apply(this, params);
    };

    this.option = function (optionName, param) {

      if (!isDefined(optionName)) {

        return options;
      }

      var method;

      switch (optionName) {

        case "starWidth":

          method = setStarWidth;
          break;
        case "numStars":

          method = setNumStars;
          break;
        case "normalFill":

          method = setNormalFill;
          break;
        case "ratedFill":

          method = setRatedFill;
          break;
        case "minValue":

          method = setMinValue;
          break;
        case "maxValue":

          method = setMaxValue;
          break;
        case "precision":

          method = setPrecision;
          break;
        case "rating":

          method = setRating;
          break;
        case "halfStar":

          method = setHalfStar;
          break;
        case "fullStar":
        
          method = setFullStar;
          break;
        case "readOnly":

          method = setReadOnly;
          break;
        case "onSet":

          method = setOnSet;
          break;
        case "onChange":

          method = setOnChange;
          break;
        default:

          throw Error("No such option as " + optionName);
      }

      return method(param);
    };

    setNumStars(options.numStars);
    setReadOnly(options.readOnly);

    this.collection.push(this);
    this.rating(options.rating);
  }

  RateYo.prototype.collection = [];


}(document));
