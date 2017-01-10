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

    this.client = new WikiClient();

    this.menuStyle = {
      borderRadius: '3px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
      background: 'rgba(255, 255, 255, 0.9)',
      borderStyle: 'solid',
      borderWidth: '1px',
      borderColor: '#bbb',
      padding: '2px 0',
      fontSize: '90%',
      position: 'fixed',
      overflow: 'auto',
      maxHeight: '50%',
    }
  }

  onSelect(value, item) {
    this.setState({ value, pages: [ item ] })
    this.props.onSubmit(item.title);
  }

  onChange(event, value) {
    this.setState({ value, loading: true })
    if (value === "") {
        this.setState({ pages: [], loading: false })
    } else {
      this.client.autocomplete(value, (items) => {
        this.setState({ pages: items, loading: false })
      })
    }
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
        renderItem={this.renderItem}
      />
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
    this.wikiClient = new WikiClient();

    this.state = {
      loading: false,
      searchTerm: props.term,
      results: [
        {language: 'german', term: 'Deutschland', url: 'https://www.google.de'},
        {language: 'english', term: 'Germany', url: 'https://www.google.de'}
      ]
    };
  }

  handleSearchSubmit(searchTerm) {
    this.setState({searchTerm: searchTerm});
    this.fetchResults(searchTerm);
  }


  fetchResults(searchTerm) {
    this.setState({loading: true});

    this.wikiClient.makeRequest(searchTerm, {}, (results) => {
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
          <div className="twelve columns">
            <SearchForm value={this.state.searchTerm} onSubmit={this.handleSearchSubmit} enabled={formEnabled} />
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
