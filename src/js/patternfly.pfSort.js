/**
 *
 */
(function (factory) {
  "use strict";
  if (typeof define === "function" && define.amd ) {
    // AMD
    define (["jquery"], function ($) {
      return factory ($, window, document);
    });
  } else if (typeof exports === "object") {
    // CommonJS
    module.exports = function (root, $) {
      if (!root) {
        root = window;
      }
      return factory($, root, root.document);
    };
  } else {
    // Browser
    factory(jQuery, window, document);
  }
}(function ($, window, document, undefined) {
  "use strict";
  var SORT_SELECTOR = ".toolbar-pf-sort"; // sort input
  var SORT_BUTTON_SELECTOR = SORT_SELECTOR + " button.dropdown-toggle"; // sort button
  var SORT_ASCDESC_BUTTON_SELECTOR = SORT_SELECTOR + " button.btn-link";

  if (!window.Pfly) {
    window.Pfly = {};
  }
  Pfly.pfSort = {};

  /**
   * Initialize
   *
   * @param {object} coll collection
   * @private
   */
  Pfly.pfSort.init = function (coll) {
    var i;
    var ctx = coll.ctx;
    var opts = (ctx.opts) ? ctx.opts : {};

    ctx._pfSort = {};
    ctx._pfSort.sortButton = $(SORT_BUTTON_SELECTOR, opts.toolbarSelector); // sort button
    ctx._pfSort.ascDescButton = $(SORT_ASCDESC_BUTTON_SELECTOR, opts.toolbarSelector);
    ctx._pfSort.sortCols = opts.sortCols; // sort colums config
    //ctx._pfSort.sortLabel = $(sort_LABEL_SELECTOR, opts.toolbarSelector); // sort label
    //ctx._pfSort.sortInput = $(sort_INPUT_SELECTOR, opts.toolbarSelector); // sort input
    //ctx._pfSort.sorts = []; // Applied sorts array
    //ctx._pfSort.activesortControls = $(ACTIVE_sort_CONTROLS_SELECTOR, opts.toolbarSelector); // Active sort controls
    //ctx._pfSort.activesorts = ctx._pfSort.activesortControls.closest("div"); // Active sorts container
    //ctx._pfSort.clearsorts = $(CLEAR_sortS_SELECTOR, opts.toolbarSelector); // Clear sorts control
    //ctx._pfSort.results = $(RESULTS_SELECTOR, opts.toolbarSelector); // Toolbar results row
    //ctx._pfSort.sortResults = $(sort_RESULTS_SELECTOR, opts.toolbarSelector); // Toolbar sort results

    if (ctx._pfSort.sortCols === undefined) {
      return;
    }

    // Set default sort properties
    for (i = 0; i < ctx._pfSort.sortCols.length; i++) {
      if (ctx._pfSort.sortCols[i] === null) {
        continue;
      }
      ctx._pfSort.sortColumn = i; // Current sort column
      ctx._pfSort.sortName = $(ctx._pfSort.sortCols[i].optionSelector).text(); // Name of current sort
      ctx._pfSort.sortOrder = 1;
      if (ctx._pfSort.sortCols[i].default === true) {
        break;
      }
    }

    // Handle click on sort menu to set current sort column and name
    for (i = 0; i < ctx._pfSort.sortCols.length; i++) {
      handlesortOption(coll, i); // Need to pass value of i as a function
    }

    // handle click on ascending/descending button
    handleascDesc(coll);
  };

  // Local functions

  function applysort (coll) {
    var ctx = coll.ctx,
      rows = $(coll.opts.rowSelector),
      parent = rows.parent();

    if (ctx._pfSort) {
      parent.append(rows.sort(function (a,b) {
        var aText = $(a).find(coll.opts.columnSelectors[ctx._pfSort.sortColumn]).text().trim(),
          bText = $(b).find(coll.opts.columnSelectors[ctx._pfSort.sortColumn]).text().trim();

        if (aText > bText) {
          return ctx._pfSort.sortOrder * 1;
        }
        if (aText < bText) {
          return ctx._pfSort.sortOrder * -1;
        }
        return 0;
      }));
    }
  }

  /**
   * Handle actions when sort options are selected
   *
   * @param {object} coll collection
   * @param {number} i The column associated with this handler
   * @private
   */
  function handlesortOption (coll, i) {
    var ctx = coll.ctx;
    if (ctx._pfSort.sortCols[i] === null || ctx._pfSort.sortCols[i].optionSelector === undefined) {
      return;
    }
    $(ctx._pfSort.sortCols[i].optionSelector).on("click", function (e) {
      // Set sort button
      if (ctx._pfSort.sortButton !== undefined && ctx._pfSort.sortButton.length !== 0) {
        ctx._pfSort.sortButton.html($(this).text() + ' <span class="caret"></span>');
      }
      ctx._pfSort.sortColumn = i; // Save sort column when applying sort
      ctx._pfSort.sortOrder = 1;
      ctx._pfSort.sortName = $(this).text(); // Save sort name for active sort control

      applysort(coll);
    });
  }

  /**
   * Handle actions when asc/desc button is clicked
   *
   * @param {object} coll collection
   * @param {number} i The column associated with this handler
   * @private
   */
  function handleascDesc (coll) {
    var ctx = coll.ctx;

    $(ctx._pfSort.ascDescButton).on("click", function (e) {
      if (ctx._pfSort.sortOrder > 0) {
        ctx._pfSort.ascDescButton.find("span").removeClass("fa-sort-alpha-asc").addClass("fa-sort-alpha-desc");
      } else {
        ctx._pfSort.ascDescButton.find("span").removeClass("fa-sort-alpha-desc").addClass("fa-sort-alpha-asc");
      }
      ctx._pfSort.sortOrder *= -1;
      applysort(coll);
    });

  }

  return Pfly.pfSort;
}));
