(function(){

var default_slugify = function(s, used_headers) { 
    return s; //SA??? unacceptable, but "Extensible Mardkdown Converter" will set proper option
};

var namedheaders = function(md, opts) {
  var slugify = (opts && opts.slugify) ? opts.slugify : default_slugify;
  var originalHeadingOpen = md.renderer.rules.heading_open;

  var used_headers = {}; //SA!!!

  md.renderer.rules.heading_open = function (tokens, idx, something, somethingelse, self) {

    tokens[idx].attrs = tokens[idx].attrs || [];

    var title = tokens[idx + 1].children.reduce(function (acc, t) {
        return acc + t.content;
      }, '');

    var slug = slugify(title, used_headers);
    tokens[idx].attrs.push(['id', slug]);

    if (originalHeadingOpen) {
      return originalHeadingOpen.apply(this, arguments);
    } else {
      return self.renderToken.apply(self, arguments);
    }
  };
};

module.exports = namedheaders;

})();
