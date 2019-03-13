import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import NativeSelect from '@material-ui/core/NativeSelect';
import FormControl from '@material-ui/core/FormControl';
import logo from '../assets/logo_transparent.png';



class MainPage extends Component {

    constructor(props){
        super(props);
        this.state = {
            floatLabelStyle: { fontSize: '19px' },
            textFieldStyle: { width: '58%' },
            searchBtnStyle: { marginTop: '19px' },
            paperSize: { height: '30%', width: '30%' },
            lyric: '',
            query: 'All'
        };
    }

    lyricChange = lyric => event => {
        this.setState({ [lyric]: event.target.value, [this.state.lyricEr] : ''});
    }

    queryChange = query => event => {
        this.setState({ [query]: event.target.value})
    }

    imageClick = () => {
        console.log("click");
    };

    search = () => {

        if (!this.state.lyric || !this.state.query) {

            if (!this.state.lyric) this.setState({ lyricEr: 'Lyric is required' });
            return
        }

        console.log(this.state.lyric);
        console.log(this.state.query);

        const search = {
            lyric: this.state.lyric,
            query: this.state.query
        }



    }

    componentDidMount(){
        console.log(123);
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
                        <FormControl className="query">
                            <InputLabel shrink htmlFor="query-native-label-placeholder">
                                Query
                            </InputLabel>
                                
                            <NativeSelect
                                value={this.state.query}
                                onChange={this.queryChange('query')}
                                input={<Input name="query" id="query-native-label-placeholder" />}
                            >
                                <option value="">All</option>
                                <option value={10}>Top 10</option>
                                <option value={20}>Top 20</option>
                                <option value={30}>Top 30</option>
                            </NativeSelect>
                        </FormControl>
                        <br />
                        <Button variant="contained" color="primary" style={this.state.searchBtnStyle} onClick={() => this.search()}>
                        Search
                        </Button>

                </div>
            </MuiThemeProvider>
        )
    }
}


const styles = {

    lyricSearchStyle: {
        width: '100vw'
    },

    searchBtnStyle: {
        marginTop: '10px',
    },
}

export default MainPage;