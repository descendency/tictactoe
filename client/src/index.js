import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Game extends React.Component {
    handleClick(i) {
        this.setState({ind: i.ind});
        // Insert Websocket to server here
        let ws = this.ws = new WebSocket('ws://localhost:4001/');
        ws.onmessage = this.message.bind(this);
        ws.onopen = this.open.bind(this);
        ws.onclose = this.close.bind(this);
    }

    componentDidMount() {
        let ws2 = this.ws2 = new WebSocket('ws://localhost:4001/');
        ws2.onmessage = this.message2.bind(this);
        ws2.onopen = this.open2.bind(this);
        ws2.onclose = this.close2.bind(this);
    }

    message2(e) {
        const event = JSON.parse(e.data);
        console.log(event)
        let board = this.state.board;
        if (event.next !== '') {
            board[event.i] = event.next;
        }
        this.setState({board: ['','','','','','','','',''], current: 'X', next: 'O'});
    }
    open2() {
        let msg = {command: "New Game", i: this.state.ind, current: this.state.current, next: this.state.next}
        this.ws2.send(JSON.stringify(msg));
    }
    close2(e) {
        //console.log(e.code);
    }
    message(e) {
        const event = JSON.parse(e.data);
        console.log(event)
        if (event.response !== 'Move Invalid'){
            let board = this.state.board;
            if (event.next !== '') {
                board[event.i] = event.next;
            }
            this.setState({board: board, current: event.current, next: event.next});
        }
        if (event.command === 'Finish') {
            this.setState({active: false, mess: event.response})
        }
    }
    open() {
        let msg = {command: "Move", i: this.state.ind, current: this.state.current, next: this.state.next}
        this.ws.send(JSON.stringify(msg));
    }
    close(e) {
        //console.log(e.code);
    }
    constructor(props) {
        super(props);
        this.state = {board: ['','','','','','','','',''], ind: -1, current: 'X', next: 'O', active: true, mess: ""};
    }

    render() {
        return (
            <React.Fragment>
                <Board
                onClick={props => this.handleClick(props)}
                board={this.state.board} />
                <Status
                gameActive={this.state.active}
                message={this.state.mess}
                symbol={this.state.current}/>
            </React.Fragment>
        );
    }
}

class Square extends React.Component {
    render() {
        return (
                <button
                onClick={() => this.props.onClick(this.props)}
                className="square">
                    {this.props.value}
                </button>
        )
    }
}

class Board extends React.Component {

    renderSquare(i) {
        return (
            <Square ind={i} value={this.props.board[i]} onClick={props => this.props.onClick(props)}/>
        );
    }
    render() {
        return(
            <div className="game">
        <div className="game-board">
                <div className='board-row'>
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className='board-row'>
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className='board-row'>
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
            </div>
        );
    }
}

class Status extends React.Component {
    render() {
        if (this.props.gameActive) {
            return(
                <h3>Player's Turn: {this.props.symbol}</h3>
            );
        } else {
            return(
                <h3>{this.props.message}</h3>
            );
        }
    }
}

ReactDOM.render(<Game />, document.getElementById('root'));
