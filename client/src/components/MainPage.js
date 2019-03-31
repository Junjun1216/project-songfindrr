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

// import Cookies from 'universal-cookie';
import Cookies from 'universal-cookie';

// API
import { cross_search, fetch_lyrics, } from "../utilities/apiUrl";
import * as apiManager from  '../helpers/apiManager';

const cookies = new Cookies();

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
        };
        this.search = this.search.bind(this);
        this.fetchLyrics = this.fetchLyrics.bind(this);
        this.homePage = this.homePage.bind(this);
    }

    lyricChange = lyric => event => {
        this.setState({ [lyric]: event.target.value, [this.state.lyricEr] : ''});
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

        let params = { 
            cleanAuthor: cleanAuthor,
            cleanTitle: cleanTitle,
        };

        apiManager.fetchApi(fetch_lyrics, params).then((res) => {
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
                cookiecontents = decodeURI(cookiecontents
                                .replace(/%3A/g, ":")
                                .replace(/%2C/g, ",")
                                .replace(/\+/g, "")
                                .replace(/%26/g, "&")
                                .replace(/%2F/g, "/")
                                .replace(/%3F/g, "?")
                                .replace(/%24/g, "$"));
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
    
    render() {

        return (

            <div style={{ background: 'linear-gradient(30deg, #ffff99 30%, #FF8E53 90%)' }}>
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
                                <GridListTile key={row.link} style={{ height: '25vh', width: '33%', paddingRight: '10px', paddingLeft: '10px'}}>
                                    <Card style={{ height: '19vh', backgroundColor: "#A7CDCC", borderRadius: "10px" }}>
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
            </div>
            
        )
    }
}

export default MainPage;