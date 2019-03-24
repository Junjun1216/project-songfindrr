import React, { View, Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import NativeSelect from '@material-ui/core/NativeSelect';
import FormControl from '@material-ui/core/FormControl';
import logo from '../assets/logo_transparent.png';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import LyricResults from './LyricResults';
import Paper from '@material-ui/core/Paper';

// API
import { local_url, search_lyrics } from "../utilities/apiUrl";
import * as apiManager from  '../helpers/apiManager';


const styles = {

    lyricSearchStyle: {
        width: '100vw'
    },

    searchBtnStyle: {
        marginTop: '10px',
    },
}

const CustomTableCell = withStyles(theme => ({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);

const Results = ({results}) => {
        return(
            <Paper>
                <Table>
                    <TableHead>
                    <TableRow>
                        <CustomTableCell>Artist</CustomTableCell>
                        <CustomTableCell align="right">Song Title</CustomTableCell>
                        <CustomTableCell align="right">Lyrics</CustomTableCell>
                        <CustomTableCell align="right">Link</CustomTableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map(row => (
                            <TableRow key={row.link}>
                            <CustomTableCell component="th" scope="row">
                                {row._id}
                            </CustomTableCell>
                            <CustomTableCell align="right">{row.title}</CustomTableCell>
                            <CustomTableCell align="right">{row.lyrics}</CustomTableCell>
                            <CustomTableCell align="right">{row.link}</CustomTableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
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
            query: 'All',
            results: []
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

    search() {

        if (!this.state.lyric || !this.state.query) {

            if (!this.state.lyric) this.setState({ lyricEr: 'Lyric is required' });
            return
        }

        let lyric = this.state.lyric


        let params = { 
            query: lyric
        };

        apiManager.searchApi(local_url + search_lyrics, params).then((res) => {
            if(res){
                this.setState({ results: res.data });
            }

        }).catch((err) => {
            console.log(err);
        });

    }

    // displayResults(queryData){
    //     var i;
    //     var rows = []

    //     for (i = 0; i < queryData.length; i++){
    //         rows.push(queryData[i]);
    //     }
        
    //     console.log(rows);

    //     return(
    //         <Table>
    //             <TableHead>
    //             <TableRow>
    //                 <CustomTableCell>Artist</CustomTableCell>
    //                 <CustomTableCell align="right">Song Title</CustomTableCell>
    //                 <CustomTableCell align="right">Lyrics</CustomTableCell>
    //                 <CustomTableCell align="right">Link</CustomTableCell>
    //             </TableRow>
    //             </TableHead>
    //             <TableBody>
    //                 {rows.map(row => (
    //                     <TableRow key={row.link}>
    //                     <CustomTableCell component="th" scope="row">
    //                         {row.name}
    //                     </CustomTableCell>
    //                     <CustomTableCell align="right">{row._id}</CustomTableCell>
    //                     <CustomTableCell align="right">{row.title}</CustomTableCell>
    //                     <CustomTableCell align="right">{row.lyrics}</CustomTableCell>
    //                     <CustomTableCell align="right">{row.link}</CustomTableCell>
    //                     </TableRow>
    //                 ))}
    //             </TableBody>
    //         </Table>
    //     )
    // }

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
                <Results results={this.state.results}/>
            </MuiThemeProvider>
            
        )
    }
}

export default MainPage;