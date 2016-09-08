describe("data tables test suite", function () {

  beforeEach(function () {
    globals.readFixture(globals.fixturePath + 'datatables.html');

    //run the plugin before each test
    $('.datatable-pf table').dataTable();
  });

  it('should render a table with striped rows and borders', function (done) {
    var table = $('.datatable-pf table');

    setTimeout(function () {
      expect(table).toHaveClass('table');
      expect(table).toHaveClass('table-striped');
      expect(table).toHaveClass('table-bordered');
      expect(table).toHaveClass('table-hover');
      done();
    }, globals.wait);
  });
/** Pagination is not currently implemented
  it('should go to page two after clicking next', function (done) {
    var pager = $('.dataTables_paginate ul li.next');
    var page = $('.dataTables_footer .pagination-input input');

    pager.click();

    setTimeout(function () {
      expect(page.val()).toEqual('2');
      done();
    }, globals.wait);
  });
*/
});
