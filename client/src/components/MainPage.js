import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import logo from '../assets/logo_transparent.png';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import ListSubheader from '@material-ui/core/ListSubheader';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

// API
import { cross_search, fetch_lyrics } from "../utilities/apiUrl";
import * as apiManager from  '../helpers/apiManager';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class MainPage extends Component {

    constructor(props){
        super(props);
        this.state = {
            floatLabelStyle: { fontSize: '19px' },
            textFieldStyle: { width: '58%' },
            searchBtnStyle: { marginTop: '19px' },
            paperSize: { height: '30%', width: '30%' },
            lyric: '',
            results: [],
            open: false,
            fetchedLyrics: '',
            cleanAuthor: '',
            cleanTitle: '',
        };
        this.search = this.search.bind(this);
        this.fetchLyrics = this.fetchLyrics.bind(this);
    }

    lyricChange = lyric => event => {
        this.setState({ [lyric]: event.target.value, [this.state.lyricEr] : ''});
    }

    imageClick = () => {
        console.log("click");
    };

    handleOpen = () => {
        this.setState({ open: true });
    };
    
      handleClose = () => {
        this.setState({ open: false });
    };

    search(e) {

        e.preventDefault();
        if (!this.state.lyric) {

            if (!this.state.lyric) this.setState({ lyricEr: 'Lyric is required' });
            return
        }

        let lyric = this.state.lyric


        let params = { 
            query: lyric
        };

        console.log(params)
        apiManager.searchApi(cross_search, params).then((res) => {
            if(res){
                this.setState({ results: res.data });
                console.log(this.state.results);
            }

        }).catch((err) => {
            console.log(err);
        });

    }

    fetchLyrics(cleanAuthor, cleanTitle){

        let params = { 
            cleanAuthor: cleanAuthor,
            cleanTitle: cleanTitle,
        };

        console.log(params)
        apiManager.get(fetch_lyrics, params).then((res) => {
            if(res){
                this.setState({ fetchedLyrics: res.data });
                this.setState({ cleanAuthor: cleanAuthor });
                this.setState({ cleanTitle: cleanTitle });
                console.log(this.state.fetchedLyrics);
            }

        }).catch((err) => {
            console.log(err);
        });

    };

    componentDidMount(){
    }
    
    render() {

        return (

            <MuiThemeProvider>
            
                <div>
                    <div>
                        <img src={logo} className="App-logo" alt="logo" onClick={this.imageClick}/>
                    </div>
                        <TextField 
                            id="standard-name"
                            label="Lyric"
                            value={this.state.lyric}
                            onChange={this.lyricChange('lyric')}
                            margin="normal"
                        />
                        <br/>
                        <Button variant="contained" color="primary" onClick={this.search}>
                        Findrr
                        </Button>
                        <br/>
                </div>
                <br/>
                <div>
                <GridList cellHeight={180}>
                    <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
                        <ListSubheader component="div"></ListSubheader>
                    </GridListTile>
                    {this.state.results && this.state.results.map(row => (
                        <GridListTile key={row.link} style={{ width: '33%', backgroundColor: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'}}>
                            <Card style={{ backgroundColor: "#D0CECE" }}>
                                <div>
                                    <CardContent>
                                        <Typography component="h5" variant="h5">
                                            {row.author} - {row.title}
                                        </Typography>
                                    </CardContent>
                                    <div>
                                        <IconButton aria-label="Play/pause">
                                            <PlayArrowIcon/>
                                        </IconButton>
                                    </div>
                                    <div>
                                        <Button variant="outlined" color="primary" onClick={this.handleOpen}>
                                            Show Lyrics
                                        </Button>
                                        <Button variant="outlined" color="primary" onClick={() => this.fetchLyrics(row.cleanAuthor, row.cleanTitle)}>
                                            Fetch Lyrics
                                        </Button>
                                        <Dialog
                                            open={this.state.open}
                                            TransitionComponent={Transition}
                                            keepMounted
                                            onClose={this.handleClose}
                                            aria-labelledby="alert-dialog-slide-title"
                                            aria-describedby="alert-dialog-slide-description"
                                        >
                                        <DialogTitle id="alert-dialog-slide-title">
                                            {this.state.cleanAuthor} - {this.state.cleanTitle}
                                        </DialogTitle>
                                        <DialogContent>
                                            <DialogContentText id="alert-dialog-slide-description">
                                                {this.state.fetchedLyrics}
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={this.handleClose} color="primary">
                                            Close
                                            </Button>
                                        </DialogActions>
                                        </Dialog>
                                    </div>
                                </div>
                            </Card>
                        </GridListTile>
                    ))}
                </GridList>
            </div>

            </MuiThemeProvider>
            
        )
    }
}

export default MainPage;