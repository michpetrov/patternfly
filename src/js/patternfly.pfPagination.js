/**
 * @summary     pfPagination for DataTables
 * @description A collection of API methods providing functionality to paginate DataTables data. This ensures
 * DataTables meets the Patternfly design pattern while maintaining accessibility.
 *
 * The pagination layout is expected to contain the classes as shown in the example below.
 *
 * Example:
 *
 * <!-- NOTE: Some configuration may be omitted for clarity -->
 * <table class="table table-striped table-bordered table-hover" id="table1">
 *   <thead>
 *     <tr>
 *       <th><input type="checkbox" name="selectAll"></th>
 *       <th>Rendering Engine</th>
 *       <th>Browser</th>
 *     </tr>
 *   </thead>
 * </table>
 * <form class="content-view-pf-pagination table-view-pf-pagination clearfix" id="pagination1">
 *   <div class="form-group">
 *     <select class="selectpicker pagination-pf-pagesize">
 *       <option value="6">6</option>
 *       <option value="10">10</option>
 *       <option value="15" selected="selected">15</option>
 *       <option value="25">25</option>
 *       <option value="50">50</option>
 *     </select>
 *     <span>per page</span>
 *   </div>
 *   <div class="form-group">
 *     <span><span class="pagination-pf-items-current">1-15</span> of <span class="pagination-pf-items-total">75</span></span>
 *     <ul class="pagination pagination-pf-back">
 *       <li><a href="#" onclick="return false;" title="First Page"><span class="i fa fa-angle-double-left"></span></a></li>
 *       <li><a href="#" onclick="return false;" title="Previous Page"><span class="i fa fa-angle-left"></span></a></li>
 *     </ul>
 *     <label for="pagination1-page" class="sr-only">Current Page</label>
 *     <input class="pagination-pf-page" type="text" value="1" id="pagination1-page"/>
 *     <span>of <span class="pagination-pf-pages">5</span></span>
 *     <ul class="pagination pagination-pf-forward">
 *       <li><a href="#" onclick="return false;" title="Next Page"><span class="i fa fa-angle-right"></span></a></li>
 *       <li><a href="#" onclick="return false;" title="Last Page"><span class="i fa fa-angle-double-right"></span></a></li>
 *     </ul>
 *   </div>
 * </form>
 * <script>
 * // NOTE: Some properties may be omitted for clarity
 * $(document).ready(function() {
 *   var dt = $("#table1").DataTable({
 *     columns: [
 *       { data: null, ... },
 *       { data: "engine" },
 *       { data: "browser" }
 *     ],
 *     data: null,
 *     dom: "t",
 *     pfConfig: {
 *       ...
 *       pageSize: 15,
 *       paginationSelector: "#pagination1",
 *     }
 *   });
 *   dt.table().pfPagination.next(); // Optional API to navigate to the next page
 *   dt.table().pfPagination.previous(); // Optional API to navigate to the previous page
 * });
 * </script>
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
  var BACK_ACTIONS_SELECTOR = ".pagination-pf-back"; // Back navigation actions
  var CURRENT_ITEMS_SELECTOR = ".pagination-pf-items-current"; // Current items text (e.g., 1-15)
  var CURRENT_PAGE_SELECTOR = ".pagination-pf-page"; // Current page input
  var FIRST_PAGE_SELECTOR = ".pagination-pf-back .fa-angle-double-left"; // First page button
  var FORWARD_ACTIONS_SELECTOR = ".pagination-pf-forward"; // Forward navigation actions
  var LAST_PAGE_SELECTOR = ".pagination-pf-forward .fa-angle-double-right"; // Last page button
  var PAGE_SIZE_SELECTOR = "select.pagination-pf-pagesize"; // Page size selection
  var TOTAL_ITEMS_SELECTOR = ".pagination-pf-items-total"; // Total items
  var TOTAL_PAGES_SELECTOR = ".pagination-pf-pages"; // Total pages text
  var PREVIOUS_PAGE_SELECTOR = ".pagination-pf-back .fa-angle-left"; // Previous page button
  var NEXT_PAGE_SELECTOR = ".pagination-pf-forward .fa-angle-right"; // Next page button

  if (!window.Pfly) {
    window.Pfly = {};
  }
  Pfly.pfPagination = {};

  /**
   * Initialize
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  Pfly.pfPagination.init = function (coll) {
    var ctx = coll.ctx;
    var opts = (ctx.opts) ? ctx.opts : {};

    ctx._pfPagination = {};
    ctx._pfPagination.backActions = $(BACK_ACTIONS_SELECTOR, opts.paginationSelector); // Back navigation actions
    ctx._pfPagination.currentItems = $(CURRENT_ITEMS_SELECTOR, opts.paginationSelector); // Current items
    ctx._pfPagination.currentPage = $(CURRENT_PAGE_SELECTOR, opts.paginationSelector); // Current page
    ctx._pfPagination.firstPage = $(FIRST_PAGE_SELECTOR, opts.paginationSelector); // First page button
    ctx._pfPagination.forwardActions = $(FORWARD_ACTIONS_SELECTOR, opts.paginationSelector); // Forward navigation actions
    ctx._pfPagination.lastPage = $(LAST_PAGE_SELECTOR, opts.paginationSelector); // Last page button
    ctx._pfPagination.nextPage = $(NEXT_PAGE_SELECTOR, opts.paginationSelector); // Next page button
    ctx._pfPagination.pageSize = $(PAGE_SIZE_SELECTOR, opts.paginationSelector); // Page size selection
    ctx._pfPagination.previousPage = $(PREVIOUS_PAGE_SELECTOR, opts.paginationSelector); // Next page button
    ctx._pfPagination.totalItems = $(TOTAL_ITEMS_SELECTOR, opts.paginationSelector); // Total items
    ctx._pfPagination.totalPages = $(TOTAL_PAGES_SELECTOR, opts.paginationSelector); // Total pages

    // Set initial page size
    ctx._pfPagination.currentPageSize = (opts.pageSize !== undefined) ? opts.pageSize : 15;

    // Handle page navigation
    handleCurrentPage(coll);
    handleFirstPage(coll);
    handleLastPage(coll);
    handlePageSize(coll);
    handleNextPage(coll);
    handlePreviousPage(coll);

    coll.updateRecordTotal();
    coll.updatePageLength(ctx._pfPagination.currentPageSize);

    // Update table on DataTables draw event
    // dt.on("draw.page", function () {
    updateAll(coll);
    // });

    // Initialize page info
    // coll.updateRecordTotal();
    // coll.updatePageLength(ctx._pfPagination.currentPageSize);
    coll.displayPage();
  };

  // Local functions

  function updateAll (coll) {
    updateCurrentPage(coll);
    updateCurrentItems(coll);
    updateTotalItems(coll);
    updateTotalPages(coll);
    updateBackActions(coll);
    updateForwardActions(coll);
  }

  /**
   * Handle page navigation when enter is pressed
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function handleCurrentPage (coll) {
    var ctx = coll.ctx;
    if (ctx._pfPagination.currentPage === undefined || ctx._pfPagination.currentPage.length === 0) {
      return;
    }
    ctx._pfPagination.currentPage.on("keypress", function (e) {
      var page, pageInfo = coll.pageInfo;
      var keycode = (e.keyCode ? e.keyCode : e.which);
      if (keycode === 13) {
        e.preventDefault();
        page = parseInt(this.value) - 1;
        if (page >= 0 && page < pageInfo.pages) {
          coll.displayPage();
        } else {
          updateCurrentPage(coll); // Always update to replace bad values
        }
        return false;
      }
      return true;
    });
  }

  /**
   * Handle page navigation when first button is selected
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function handleFirstPage (coll) {
    var ctx = coll.ctx;
    if (ctx._pfPagination.firstPage === undefined || ctx._pfPagination.firstPage.length === 0) {
      return;
    }
    $(ctx._pfPagination.firstPage).closest('li').on("click", function (e) {
      coll.updatePage(0);
      updateAll(coll);
      coll.displayPage();
    });
  }

  /**
   * Handle page navigation when last button is selected
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function handleLastPage (coll) {
    var ctx = coll.ctx;
    if (ctx._pfPagination.lastPage === undefined || ctx._pfPagination.lastPage.length === 0) {
      return;
    }
    $(ctx._pfPagination.lastPage).closest('li').on("click", function (e) {
      coll.updatePage(coll.pageInfo.pages - 1);
      updateAll(coll);
      coll.displayPage();
    });
  }

  /**
   * Handle page navigation when next button is selected
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function handleNextPage (coll) {
    var ctx = coll.ctx;
    if (ctx._pfPagination.nextPage === undefined || ctx._pfPagination.nextPage.length === 0) {
      return;
    }
    $(ctx._pfPagination.nextPage).closest('a').on("click", function (e) {
      coll.updatePage(coll.pageInfo.page + 1);
      updateAll(coll);
      coll.displayPage();
    });
  }

  /**
   * Handle page size when selected
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function handlePageSize (coll) {
    var ctx = coll.ctx;
    if (ctx._pfPagination.pageSize === undefined || ctx._pfPagination.pageSize.length === 0) {
      return;
    }
    ctx._pfPagination.pageSize.on("change", function (e) {
      ctx._pfPagination.currentPageSize = parseInt(this.value);
      coll.updatePageLength(ctx._pfPagination.currentPageSize);
      updateAll(coll);
      coll.displayPage();
    });
  }

  /**
   * Handle page navigation when previous button is selected
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function handlePreviousPage (coll) {
    var ctx = coll.ctx;
    if (ctx._pfPagination.previousPage === undefined || ctx._pfPagination.previousPage.length === 0) {
      return;
    }
    $(ctx._pfPagination.previousPage).closest('a').on("click", function (e) {
      coll.updatePage(coll.pageInfo.page - 1);
      updateAll(coll);
      coll.displayPage();
    });
  }

  /**
   * Update current page
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function updateCurrentPage (coll) {
    var ctx = coll.ctx;
    var pageInfo = coll.pageInfo;
    var page = (pageInfo.recordsDisplay === 0) ? 0 : pageInfo.page + 1;
    if (ctx._pfPagination.currentPage === undefined || ctx._pfPagination.currentPage.length === 0) {
      return;
    }
    // Disable if pagination is not available due to filtering
    if (pageInfo.recordsDisplay > pageInfo.length) {
      $(ctx._pfPagination.currentPage).prop("disabled", false);
    } else {
      $(ctx._pfPagination.currentPage).prop("disabled", true);
    }
    // Set current page value
    $(ctx._pfPagination.currentPage).val(page);
  }

  /**
   * Update back navigation actions
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function updateBackActions (coll) {
    var ctx = coll.ctx;
    var pageInfo = coll.pageInfo;
    if (pageInfo.page === 0) {
      $("li", ctx._pfPagination.backActions).each(function () {
        $(this).addClass("disabled");
      });
    } else {
      $("li", ctx._pfPagination.backActions).each(function () {
        $(this).removeClass("disabled");
      });
    }
  }

  /**
   * Update current items
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function updateCurrentItems (coll) {
    var ctx = coll.ctx;
    var pageInfo = coll.pageInfo;
    var start = (pageInfo.recordsDisplay === 0) ? 0 : pageInfo.start + 1;
    ctx._pfPagination.currentItems.html(start + "-" + pageInfo.end);
  }

  /**
   * Update forward navigation actions
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function updateForwardActions (coll) {
    var ctx = coll.ctx;
    var pageInfo = coll.pageInfo;
    if (pageInfo.recordsDisplay === 0 || pageInfo.page === pageInfo.pages - 1) {
      $("li", ctx._pfPagination.forwardActions).each(function () {
        $(this).addClass("disabled");
      });
    } else {
      $("li", ctx._pfPagination.forwardActions).each(function () {
        $(this).removeClass("disabled");
      });
    }
  }

  /**
   * Update total items
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function updateTotalItems (coll) {
    var ctx = coll.ctx;
    var pageInfo = coll.pageInfo;

    ctx._pfPagination.totalItems.html(pageInfo.recordsDisplay);
  }

  /**
   * Update total pages
   *
   * @param {DataTable.Api} dt DataTable
   * @private
   */
  function updateTotalPages (coll) {
    var ctx = coll.ctx;
    var pageInfo = coll.pageInfo;

    ctx._pfPagination.totalPages.html(pageInfo.pages);
  }

  // DataTables API

  /**
   * Navigate to next page
   *
   * Example: dt.table().pfPagination.next();
   */
  // DataTable.Api.register("pfPagination.next()", function () {
  //   return this.iterator("table", function (ctx) {
  //     handleNextPage(new DataTable.Api(ctx));
  //   });
  // });

  /**
   * Navigate to previous page
   *
   * Example: dt.table().pfPagination.previous();
   */
  // DataTable.Api.register("pfPagination.previous()", function () {
  //   return this.iterator("table", function (ctx) {
  //     handlePreviousPage(new DataTable.Api(ctx));
  //   });
  // });

  // DataTables creation
  // $(document).on("init.dt", function (e, ctx, json) {
  //   if (e.namespace !== "dt") {
  //     return;
  //   }
  //   Pfly.pfPagination.init(new DataTable.Api(ctx));
  // });
  return Pfly.pfPagination;
}));
