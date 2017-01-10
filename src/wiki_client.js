import $ from 'jquery';

class WikiClient {
  constructor(language) {
    this.language = language;
    this.hostUrl = `https://${language}.wikipedia.org/w/api.php`;
  }

  buildContinueParamsString(continueParams) {
    let keys = Object.keys(continueParams);
    if (keys.length === 0) return 'continue=';

    return keys.map((key) => { return `${key}=${continueParams[key]}` }).join('&');
  }

  langlinksFromResponse(response) {
    let pages = response.query.pages;
    let langlinks = [];

    Object.keys(pages).forEach((key) => {
      let pageLanglinks = pages[key.toString()].langlinks;

      if (pageLanglinks) {
        pageLanglinks.forEach((langlink) => {
          langlinks.push({
            language: langlink.langname,
            url: langlink.url,
            term: langlink['*']
          });
        });
      }
    });

    return langlinks;
  }

  pagetitlesFromResponse(response) {
    let pages = response.query.pages;
    let titles = [];

    Object.keys(pages).forEach((key) => {
      let title = pages[key.toString()].title;

      if (title) {
        titles.push({ title: title });
      }
    });

    return titles;
  }

  buildUrl(searchTerm, continueQuery) {
    let queryParams = [
      'action=query',
      'format=json',
      'prop=langlinks',
      'llprop=langname|url',
      'callback=?',
      `titles=${searchTerm}`,
      continueQuery
    ];
    let query = queryParams.join('&');

    return `${this.hostUrl}?${query}`;
  }

  makeRequest(searchTerm, continueParams, cb, doneCb) {
    const continueQuery = this.buildContinueParamsString(continueParams);
    const url = this.buildUrl(searchTerm, continueQuery);

    $.getJSON(url, (data) => {
      let results = this.langlinksFromResponse(data);

      if (data.continue) {
        this.makeRequest(searchTerm, data.continue, (additionalResults) => {
          let extendedResults = results.concat(additionalResults);
          cb(extendedResults);
        }, doneCb);
      } else {
        doneCb();
      }

      cb(results);
    })
  }

  autocomplete(term, cb) {
    let queryParams = [
      'action=query',
      'callback=?',
      'format=json',
      'generator=prefixsearch',
      'gpslimit=6',
      'gpsnamespace=0',
      `gpssearch=${term}`,
      'ppprop=displaytitle',
      'prop=pageprops',
      'wbptterms=description'
    ];

    let query = queryParams.join('&');
    let url = `${this.hostUrl}?${query}`;

    $.getJSON(url, (response) => {
      let titles = this.pagetitlesFromResponse(response);
      cb(titles);
    })
  }
}

export default WikiClient;
