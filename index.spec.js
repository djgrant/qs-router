import 'babel/polyfill';
import should from 'should';
import $ from 'jquery';
import * as router from './index';

const FN = function () {};

describe('Router', function () {

  afterEach(function () {
    router.history.route = undefined;
    router.history.state = undefined;
    router.history.previousRoute = undefined;
    router.history.previousState = undefined;
    router.$events.off('routechange');

    ['test', 'next'].forEach(function (key) {
      var resetURL = router.removeQuery(key);
      history.replaceState(null, '', resetURL);
    });
  });

  it('should exist', function () {
    router.should.be.type('object');
  });

  it('should change the url when navigate() is called', function () {
    if (!history.pushState) return;
    router.navigate('test', '1');
    location.search.includes('test=1').should.equal(true);
  });

  it('should accept a single argument to navigate', function () {
    if (!history.pushState) return;
    router.navigate('test', true);
    location.search.includes('test=true').should.equal(true);
  });

  it('should execute a callback when a route is entered', function (done) {
    router.register('test=1', function () {
      done();
    });
    router.navigate('test', '1');
  });

  it('should execute a callback when a route is exited', function (done) {
    this.slow(1000);
    router.register('test=1', FN, function () {
      done();
    });
    router.navigate('test', '1');
    router.navigate('next', '1');
  });

  it('should keep its own record of history', function () {
    router.register('test', function() {
      router.history.route.should.equal('test');
      router.history.state.should.equal('state');
    }, function () {
      router.history.route.should.equal('next');
      router.history.state.should.equal('newstate');
    });
    router.navigate('test', 'state');
    router.navigate('next', 'newstate');
  });

  it('should do nothing when the same route is fired twice', function () {
    router.navigate('test');
    router.navigate('test');
    (router.history.previousRoute === undefined).should.equal(true);
  });

  it('should maintain the current query string');

  it('should maintain the current url fragment');

  it('should navigate back when navigating to the previous route');

  describe('Utilities', function () {
    it('should append a query to a url', function() {
      var query = { test: 'hello' };
      var url = {
        protocol: 'http:',
        hostname: 'example.com',
        pathname: '/test/',
        hash: '#test',
        search: '?a=1&b=2'
      }
      var target = 'http://example.com/test/?a=1&b=2&test=hello#test';
      router.appendQuery(query, url).should.equal(target);
    });

    it('should remove a query from a a url', function () {
      var key = 'test';
      var url = { search: '?a=1&b=2&test=3&d=4' };
      router.removeQuery(key, url).should.equal('?a=1&b=2&d=4');
    });

    it('should push a new internal history state');
  });
});
