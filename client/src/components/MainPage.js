import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import logo from '../assets/logo_transparent.png';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import MicIcon from '@material-ui/icons/Mic';
import Typography from '@material-ui/core/Typography';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import ListSubheader from '@material-ui/core/ListSubheader';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

// import Cookies from 'universal-cookie';
import Cookies from 'universal-cookie';

import SpeechRecognition from 'react-speech-recognition'

// API
import { cross_search, fetch_lyrics, } from "../utilities/apiUrl";
import * as apiManager from  '../helpers/apiManager';

const cookies = new Cookies();

const options ={
    autoStart: false,
    continous: false
};

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class MainPage extends Component {

    constructor(props){
        super(props);
        this.state = {
            lyric: '',
            results: [],
            open: false,
            fetchedLyrics: '',
            author: '',
            title: '',
            color: "primary",
            talk: false,
        };
        this.search = this.search.bind(this);
        this.fetchLyrics = this.fetchLyrics.bind(this);
        this.homePage = this.homePage.bind(this);
        this.speechText = this.speechText.bind(this);
    }

    lyricChange = lyric => event => {
        this.setState({ [lyric]: event.target.value });
    }

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

        let logoSpin = document.getElementsByClassName("App-logo");
        logoSpin[0].style.animation = "App-logo-spin infinite 4s linear";
    
        apiManager.searchApi(cross_search, params).then((res) => {
            if(res){
                this.setState({ results: res.data });
                logoSpin[0].style.animation = "none";
            }

        }).catch((err) => {
            console.log(err);
        });

    }

    getCookie(name){
        let nameEQ = name + "=";
        let q = document.cookie.split(';');
        for (var i = 0; i < q.length; i++) {
            var c = q[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    fetchLyrics(cleanAuthor, cleanTitle, author, title){

        this.setState({ fetchedLyrics: cleanAuthor });
        let params = { 
            cleanAuthor: cleanAuthor,
            cleanTitle: cleanTitle,
        };

        apiManager.get(fetch_lyrics, params).then((res) => {
            if(res){
                this.setState({ fetchedLyrics: res.data });
                this.setState({ author: author });
                this.setState({ title: title });
                this.setState({ open: true });
            }

        }).catch((err) => {
            console.log(err);
        });

    };

    componentDidMount(){
        if (cookies.get("querySongs") !== undefined){
            try{
                let cookiecontents = this.getCookie("querySongs");
                cookiecontents = decodeURI(cookiecontents.replace(/%3A/g, ":").replace(/%2C/g, ",").replace(/\+/g, "").replace(/%26/g, "&").replace(/%2F/g, "/").replace(/%3F/g, "?").replace(/%24/g, "$"));
                cookiecontents = JSON.parse(cookiecontents);
                if (cookiecontents == null){
                    this.setState({ results: '' });
                }
                else{
                    this.setState({ results: cookiecontents });
                }
            }
            catch(err){
                console.log(err)
            }
        }
    }

    homePage(){
        try{
            let myCookie = cookies.get('querySongs');
            if (myCookie != null){
                cookies.remove('querySongs');
                this.setState({ results: [] });
            }

        }
        catch(err){
           console.log(err)
        }

    }

    speechText(){
        const { transcript, resetTranscript, startListening, stopListening, abortListening } = this.props
        if (this.state.talk === false){
            startListening();
            resetTranscript();
            this.setState({ talk: true})
            this.setState({ color: "secondary" });
        }
        else if (this.state.talk === true){
            stopListening();
            this.setState({ lyric: transcript})
            this.setState({ color: "primary" });
            resetTranscript();
            this.setState({ talk: false})
            abortListening();
        }
    }

    render() {

        return (

            <MuiThemeProvider>
                <div>
                    <div id="imgContainer" onClick={this.homePage}>
                        <img src={logo} className="App-logo" alt="logo"/>
                    </div>
                    <br/>
                    <TextField 
                        id="standard-name"
                        label="Lyric"
                        value={this.state.lyric}
                            onChange={this.lyricChange('lyric')}
                        margin="normal"
                    />
                    <div>
                        <IconButton color={this.state.color} onClick={this.speechText}>
                            <MicIcon></MicIcon>
                        </IconButton>
                    </div>
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
                            <GridListTile style={{ height: 'auto', width: '50%', paddingRight: '10px', paddingLeft: '10px', paddingBottom: '10px',}}>
                                <Card style={{ height: 'auto', width: 'auto', backgroundColor: "#A7CDCC", borderRadius: "10px" }}>
                                    <div>
                                        <CardContent>
                                            <Typography component="h5" variant="h5">
                                                {row.author} - {row.title}
                                            </Typography>
                                        </CardContent>
                                        <div>
                                            <Button variant="outlined" color="primary" onClick={() => this.fetchLyrics(row.cleanAuthor, row.cleanTitle, row.author, row.title)}>
                                                Show Lyrics
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
                                                {this.state.author} - {this.state.title}
                                            </DialogTitle>
                                            <DialogContent>
                                                <Typography id="alert-dialog-slide-description" variant="body1">
                                                    {this.state.fetchedLyrics}
                                                </Typography>
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

export default SpeechRecognition(options)(MainPage);