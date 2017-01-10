import $ from 'jquery';

class WikiClient {
  constructor() {
    this.hostUrl = 'https://en.wikipedia.org/w/api.php';
    this.baseQueryParams = 'action=query&format=json&prop=langlinks&llprop=langname|url&callback=?';
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

  buildUrl(searchTerm, continueQuery) {
    return `${this.hostUrl}?${this.baseQueryParams}&titles=${searchTerm}&${continueQuery}`;
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
}

export default WikiClient;
