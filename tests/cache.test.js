import 'jest-localstorage-mock';
import cache from '../react-app/src/utils/cache.js';

describe('cache', () => {
  beforeEach(() => {
    cache.clearAll();
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('set stores value and retrieves with get', () => {
    cache.set('foo', 'bar');
    expect(cache.get('foo')).toBe('bar');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'cache_foo',
      expect.any(String)
    );
  });

  test('get retrieves from localStorage when memory missing', () => {
    const data = { value: 'bar', timestamp: Date.now() };
    localStorage.setItem('cache_foo', JSON.stringify(data));
    expect(cache.get('foo')).toBe('bar');
  });

  test('clear removes item from memory and localStorage', () => {
    cache.set('baz', 'qux');
    cache.clear('baz');
    expect(cache.get('baz')).toBeNull();
    expect(localStorage.getItem('cache_baz')).toBeNull();
  });

  test('clearAll removes all cached items only', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    localStorage.setItem('other', '123');
    cache.clearAll();
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
    expect(localStorage.getItem('cache_a')).toBeNull();
    expect(localStorage.getItem('cache_b')).toBeNull();
    expect(localStorage.getItem('other')).toBe('123');
  });
});
