import React, { Component } from 'react';

import WikiClient from './wiki_client';

import './normalize.css';
import './skeleton.css';
import './App.css';

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {value: this.props.value};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.value);
  }

  render() {
    let submit = null;

    if (this.props.enabled) {
      submit = <input className="button-primary" type="submit" value="Submit" />
    } else {
      submit = <input className="button-primary" type="submit" value="Submit" disabled="disabled" />
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" value={this.state.value} onChange={this.handleChange} />
        {submit}
      </form>
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
          <SearchForm value={this.state.searchTerm} onSubmit={this.handleSearchSubmit} enabled={formEnabled} />
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
