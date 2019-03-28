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

// API
import { local_url, search_lyrics, cross_search, fetch_lyrics } from "../utilities/apiUrl";
import * as apiManager from  '../helpers/apiManager';

const styles = {

    lyricSearchStyle: {
        width: '100vw'
    },

    searchBtnStyle: {
        marginTop: '10px',
    },
}

const Results = ({results}) => {

        return(
            <div>
                <GridList cellHeight={180}>
                    <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
                        <ListSubheader component="div"></ListSubheader>
                    </GridListTile>
                    {results.map(row => (
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
                                </div>
                            </Card>
                        </GridListTile>
                    ))}
                </GridList>
            </div>
        );
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
        };
        this.search = this.search.bind(this);
    }

    lyricChange = lyric => event => {
        this.setState({ [lyric]: event.target.value, [this.state.lyricEr] : ''});
    }

    imageClick = () => {
        console.log("click");
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
        apiManager.searchApi(local_url + cross_search, params).then((res) => {
            if(res){
                this.setState({ results: res.data });
            }

        }).catch((err) => {
            console.log(err);
        });

    }

    componentDidMount(){
    }
    
    render() {
        const { lyricSearchStyle } = styles;

        return (

            <MuiThemeProvider>
            
                <div style={lyricSearchStyle}>
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
                        <Button variant="contained" color="primary" style={this.state.searchBtnStyle} onClick={this.search}>
                        Findrr
                        </Button>
                        <br/>
                </div>
                <br/>
                <Results results={this.state.results}/>

            </MuiThemeProvider>
            
        )
    }
}

export default MainPage;