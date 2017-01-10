import React, { Component } from 'react';
import Autocomplete from 'react-autocomplete';

import WikiClient from './wiki_client';

import './normalize.css';
import './skeleton.css';
import './App.css';

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {value: this.props.value, pages: []};

    this.onSelect = this.onSelect.bind(this);
    this.onChange = this.onChange.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
  }

  onSelect(value, item) {
    this.setState({ value, pages: [ item ] })
    this.props.onSubmit(item.title);
  }

  onChange(event, value) {
    this.setState({ value, loading: true })

    if (value === '') {
      this.setState({ pages: [], loading: false });
    } else {
      this.props.wikiClient.autocomplete(value, (items) => {
        this.setState({ pages: items, loading: false })
      })
    }
  }

  renderMenu(items, value, style) {
    if (items.length === 0) return <div></div>;

    return <div className="autocomplete-menu" style={{...style}} children={items} />
  }

  renderItem(item, isHighlighted) {
    return (
      <div
        className={isHighlighted ? "highlighted-item" : "non-highlighted-item" }
        key={item.title}
        id={item.title}
      >{item.title}</div>
    )
  }

  render() {
    return (
      <Autocomplete
        wrapperStyle={{}}
        inputProps={{name: "Search Term", id: "page-autocomplete", type: "text", className: "u-full-width"}}
        ref="autocomplete"
        value={this.state.value}
        items={this.state.pages}
        getItemValue={(item) => item.title}
        onSelect={this.onSelect}
        onChange={this.onChange}
        renderMenu={this.renderMenu}
        renderItem={this.renderItem}
      />
    )
  }
}

class LanguageSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {value: this.props.value};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    let language = event.target.value;
    this.setState({value: language});
    this.props.onChange(language);
  }

  render() {
    return (
      <div>
        <select value={this.state.value} onChange={this.handleChange} className="u-full-width">
          <option value="en">English</option>
          <option value="de">German</option>
        </select>
      </div>
    )
  }
}

class SearchResult extends Component {
  render() {
    return (
      <div className="row resultItem">
        <div className="two columns">
          <span className="language">{this.props.language}</span>
        </div>
        <div className="ten columns">
          <span><a href={this.props.url}>{this.props.term}</a></span>
        </div>
      </div>
    )
  }
}

class LoadingIndicator extends Component {
  render() {
    let hiddenClass = this.props.loading ? "" : "hidden";
    return <span className={hiddenClass}>Loading...</span>
  }
}

class SearchResultsList extends Component {
  render() {
    const results = this.props.results;
    const resultItems = results.map((r) =>
      <li key={r.language}>
        <SearchResult language={r.language} term={r.term} url={r.url} />
      </li>
    );

    return (
      <div>
        <span className="resultsLength">{results.length} Results</span>
        <ul className="results">{resultItems}</ul>
      </div>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);

    let language = 'en';
    let wikiClient = new WikiClient(language);

    this.state = {
      language: 'en',
      loading: false,
      searchTerm: props.term,
      wikiClient: wikiClient,
      results: []
    };
  }

  handleSearchSubmit(searchTerm) {
    this.setState({searchTerm: searchTerm});
    this.fetchResults(searchTerm);
  }

  handleLanguageChange(language) {
    let wikiClient = new WikiClient(language);
    this.setState({language: language, wikiClient: wikiClient});
  }

  fetchResults(searchTerm) {
    this.setState({loading: true});

    this.state.wikiClient.makeRequest(searchTerm, {}, (results) => {
      this.setState({results: results})
    }, () => {
      this.setState({loading: false});
    });
  }

  render() {
    const formEnabled = !this.state.loading;

    return (
      <div className="container">
        <div className="row">
          <div className="twelve columns">
            <h2>Welcome to Wikitranslate!</h2>
          </div>
        </div>

        <div className="row">
          <div className="two columns">
            <LanguageSelector value={this.state.language} onChange={this.handleLanguageChange} />
          </div>
          <div className="ten columns">
            <SearchForm value={this.state.searchTerm} wikiClient={this.state.wikiClient} onSubmit={this.handleSearchSubmit} enabled={formEnabled} />
          </div>
        </div>

        <div className="row">
          <div className="twelve columns">
            <LoadingIndicator loading={this.state.loading} />
          </div>
        </div>

        <div className="row">
          <div className="twelve columns">
            <SearchResultsList results={this.state.results} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
