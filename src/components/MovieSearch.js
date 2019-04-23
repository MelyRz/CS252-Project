import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import logo from '../imgs/movie.png';
import Search from './Search';
import BookSearch from './BookSearch';

import firebase from 'firebase/app';
import axios from 'axios';
import ReactDOM from 'react-dom';
import ListItem from '@material-ui/core/ListItem';


class MovieSearch extends React.Component{
  constructor(props) {
    super(props);
    
    this.state = {
      triggers: [],
      movies: [],
      query: '',
      open: false,
      movieId: 'tt1442449', // default imdb id (Spartacus)
      title: '',
      movie: {},
      searchResults: [],
      isSearching: false,
      popupDisplay: 'none',
      activeIndex: 0,
    };
    

  }
  
  componentDidMount() {
    this.loadMovie()
}

componentDidUpdate(prevProps, prevState) {
    if (prevState.movieId !== this.state.movieId) {
        this.loadMovie()
    }
}

loadMovie() {
    axios.get(`http://www.omdbapi.com/?apikey=7abe36ea&i=${this.state.movieId}`)
        .then(response => {
            this.setState({ movie: response.data });
        })
        .catch(error => {
            console.log('Opps!', error.message);
        })
}

// we use a timeout to prevent the api request to fire immediately as we type

searchMovie = (event) => {
    this.setState({ title: event.target.value, isSearching: true })
  var that = this;
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
        axios.get(`https://www.omdbapi.com/?apikey=7abe36ea&s=${this.state.title}`)
            .then(response => {
                var movie = [];
                if (response.data.Search) {
                    const movies = response.data.Search.slice(0, 5);
                    for( var i =0; i< 5; i++){
                      movie[i] = movies[i].Title
                    }
                    that.setState({ searchResults: movie });
                }
            })
            .catch(error => {
                console.log('Opps!', error.message);
            })
    }, 1000)


}

// event handler for a search result item that is clicked
itemClicked = (item) => {
    this.setState(
        {
            title: item
        }
    )
}

  handleChange = event => {
    this.setState({ [event.target.id]: event.target.value })
  };

  handleMultiChange = (event, {value}) => {
    this.setState({ triggers: value });
  }

  handleSubmit = () => {
    //add the stuff to database
    var user = firebase.auth().currentUser;
    let db = firebase.firestore();
    var that = this;
    db.collection('Movies').doc(that.state.title).get().then(function(doc) {
      if(doc.exists){
          that.setState({trigger: doc.data().Triggers});
          console.log("Triggers: ", doc.data().Triggers);

        const moviePage = (
          <div>
          <Paper className={that.props.classes.paper}>
          <Typography><h1>{that.state.title}</h1></Typography>
          <hr color="black" width="10%"/>
          <Typography><h3>Triggers:</h3></Typography>
          <Typography><h4>{that.state.trigger}</h4></Typography>
          </Paper>
          <br></br>
          <br></br>
          </div>
        );
          ReactDOM.render(moviePage, document.getElementById('movieTrigs'));
      }
      else {
          const moviePage = (<Paper className={that.props.classes.paper}>
            <Typography><h1>{that.state.title}</h1></Typography>
            <hr color="black" width="10%"/>
            <Typography><h3>Triggers:</h3></Typography>
            <Typography><h4>Currently don't have data on this movie.</h4></Typography>
            </Paper>);
            ReactDOM.render(moviePage, document.getElementById('movieTrigs'));
      }
  }).catch(function(error) {
      console.log("Error getting information:", error);
  });
  }
  handleClose = () => {
    this.setState({ open: false });
    window.location.reload();
  };
  handleClickOpen = () => {
    this.setState({ open: true });
  };
  handleTabChange = (_, activeIndex) => this.setState({ activeIndex })
  showTrigger = () => {
    this.setState({
      popupDisplay: 'block',
    });
  }
  goBack = () =>{
    //this.props.history.push('/home');
    this.props.history.goBack() 
  }    
    render() {
      const { movies, query } = this.state;
      const isSearched = query => item => !query || item.title.toLowerCase().includes(query.toLowerCase());
      const { activeIndex } = this.state;
      const isInval =  this.state.title === ''

        return (
          <div className={this.props.classes.container}>
            <Paper className={this.props.classes.paper}>
              <img className={this.props.classes.logo} src={logo} alt="DodgeEm"/>
              <form id="loginForm" onSubmit = {this.handleSubmit} >
                
                <Search
                    defaultTitle={this.state.title}
                    search={this.searchMovie}
                    results={this.state.searchResults}
                    clicked={this.itemClicked}
                    searching={this.state.isSearching} />

                {<Typography className={this.props.classes.error}>{this.state.error}</Typography>}
                <Button id="loginBtn" onClick={this.goBack} variant="contained" color="secondary" form="loginForm" className={this.props.classes.button}>GO BACK</Button>
                <Button id="loginBtn" disabled={isInval} onClick={this.handleSubmit} variant="contained" color="primary" form="loginForm" className={this.props.classes.button}>SEARCH</Button>
              </form>
            </Paper>
            <div id="movieTrigs">
            </div>
            
            {/*<p> {this.state.title} </p>
            <p> {this.state.trigger} </p>*/}
          </div>
        );
      }
}
const styles = theme => ({
    container: {
      marginTop: 80,
      marginLeft: 15,
      marginRight: 15,
    },
    button: {
      color: 'white',
      marginTop: 10,
      margin: theme.spacing.unit,
    },
    error: {
      color: "red",
      marginTop: 10
    },
    resetButton: {
      onClick: 'true',
      textAlign: 'center',
      color: '#2a7fff',
    },
    popup: {
      margin: 'auto',
    },
    paper: {
      padding: theme.spacing.unit * 2,
      textAlign: 'center',
      marginTop: '100px !important',
      margin: 'auto',
      'max-width': '800px',
      'max-height': '800px',
    },
    logo: {
      color: 'black',
      'max-width': '175px',
      'max-height': '175px',
      margin: 'auto',
      display: 'block',
      position: 'center',
    },
    field: {
      textAlign: 'left',
      margin: 'auto',
      paddingBottom: 10,
      width: '75%',
    },
  });
  export default withStyles(styles)(MovieSearch);