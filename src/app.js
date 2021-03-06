import React from 'react'
import ReactDOM from 'react-dom'

import axios from 'axios'
import 'bulma'
import './style.scss'

const apiKeyMovieDB = process.env.MOVIEDB_KEY
const apiKeyOMDB = process.env.OMDB_KEY
const baseUrlOMDB = `https://www.omdbapi.com/?apikey=${apiKeyOMDB}`

import DisplayTime from './components/DisplayTime'
import DisplayMoviesWatched from './components/DisplayMoviesWatched'
import SearchBar from './components/SearchBar.js'
import RecommendedMovies from './components/RecommendedMovies.js'

class App extends React.Component {
  constructor(){
    super()

    this.state={
      searchText: '',
      timeWatched: 0,
      moviesWatched: [],
      tweets: []
    }
    this.run = true
    this.handleChange = this.handleChange.bind(this)
    this.getMovie = this.getMovie.bind(this)
    this.getRelatedMovies = this.getRelatedMovies.bind(this)
    this.getId = this.getId.bind(this)
  }

  componentDidUpdate(){
    if(this.run && this.state.searchText.length > 2) this.getPossibleResults()
    this.run = false
  }

  handleChange(e){
    this.run = true
    this.setState({ searchText: e.target.value })
  }

  getPossibleResults(){
    axios
      .get(`${baseUrlOMDB}&s=${this.state.searchText}`)
      .then(res => {
        const filtered = res.data.Search.filter(result => result.Type==='movie')
        this.setState({ possibleResults: filtered })
      })
      .catch(err => console.log(err))
  }

  getMovie(imdb, e){
    let imdbID
    if(e) imdbID = e.currentTarget.id
    if(imdb) imdbID = imdb
    this.setState({ searchText: '', possibleResults: []})
    axios
      .get(`${baseUrlOMDB}&i=${imdbID}`)
      .then(res => {
        this.setState({
          timeWatched: this.state.timeWatched + parseFloat(res.data.Runtime),
          moviesWatched: [res.data, ...this.state.moviesWatched]
        })
      })
    const movieName = e.currentTarget.firstElementChild.innerHTML.replace(' ', '')
    console.log(movieName)
    // this.getTweets(movieName)
    this.getRelatedMovies(imdbID)
  }

  getId(id){
    axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKeyMovieDB}`)
      .then(res => this.getMovie(res.data.imdb_id))
  }

  getRelatedMovies(id){
    axios
      .get(`https://api.themoviedb.org/3/find/${id}?api_key=${apiKeyMovieDB}&external_source=imdb_id`)
      .then(res => this.makeRecommendedRequest(res.data.movie_results[0].id))
  }

  makeRecommendedRequest(id){
    axios.get(`https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${apiKeyMovieDB}`)
      .then(res => this.setState({ relatedMovies: res.data.results}))
  }

  render() {
    return (
      <main>
        <section className="section">
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-8">
                <DisplayTime timeWatched={this.state.timeWatched} />
                <SearchBar
                  getMovie={this.getMovie}
                  handleChange={this.handleChange}
                  searchText={this.state.searchText}
                  possibleResults={this.state.possibleResults}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="columns section">

          <div className="column is-9 middle-part">
            <DisplayMoviesWatched movies={this.state.moviesWatched} />
          </div>

          <div className="column is-3 side-part">
            {this.state.relatedMovies &&
            <RecommendedMovies
              movies={this.state.relatedMovies}
              getId={this.getId}
            />}
          </div>

        </section>

      </main>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
