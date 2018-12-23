package main;

import (
    "fmt"
    "net/http"
    "github.com/gorilla/websocket"
    "encoding/json"
)
type GameState struct {
    board [9]string
    active bool
    turnCount int
}

func (g *GameState) getBoard() [9]string {
    return g.board;
}

func (g *GameState) setBoard(i int, t string) {
    g.board[i] = t

}
var game = GameState{
    board: [9]string{"","","","","","","","",""},
    active: true,
    turnCount: 0,
}

var upgrader = websocket.Upgrader{
    ReadBufferSize:1024,
    WriteBufferSize:1024,
    CheckOrigin: func(r *http.Request) bool { return true },
}

type Message struct {
    Command string `json:"command"`
    Response string `json:"response"`
    I int `json:"i"`
    Next string `json:"next"`
    Current string `json:"current"`
};

func (g GameState) hasWon(sym string) bool {
    for i := 0; i < 3; i++ {
        // horizontal
        if g.board[i+3] == sym && g.board[i] == sym && g.board[i+6] == sym {
            return true;
        }
        // vertical
        if g.board[0+3*i] == sym && g.board[1+3*i] == sym && g.board[2+3*i] == sym {
            return true;
        }
    }
    // backslash
    if g.board[0] == sym && g.board[4] == sym && g.board[8] == sym {
        return true;
    }

    //forward slash
    if g.board[2] == sym && g.board[4] == sym && g.board[6] == sym {
        return true;
    }
    return false;
}

func handler(w http.ResponseWriter, r *http.Request){
    socket, _ := upgrader.Upgrade(w, r, nil)

    for {

        msgType, msg, _ := socket.ReadMessage()
        fmt.Println(string(msg));
        var m Message;
        json.Unmarshal(msg, &m);

        if (m.Command == "New Game") {
            game = GameState{[9]string{"","","","","","","","",""}, true, 0}
        } else if (m.Command == "Move") {
            if (!(game.active)) {
                continue
            }
            if (game.getBoard()[m.I] != "") {
                m.Response = "Move Invalid"
            } else {
                game.setBoard(m.I, m.Current)
                m.Response = "Move Valid"
                if (m.Next == "X") {
                    m.Next = "O"
                    m.Current = "X"
                } else {
                    m.Next = "X"
                    m.Current = "O"
                }
                game.turnCount++;
            }
        }
        fmt.Println(game.getBoard());
        msg, _ = json.Marshal(&m)
        socket.WriteMessage(msgType, msg);
        if (game.turnCount > 8) {
            m.Command = "Finish"
            m.Response = "It is a draw!";
            msg, _ = json.Marshal(&m)
            socket.WriteMessage(msgType, msg);
            game.active = false
        }
        if (game.hasWon(m.Next)) {
            m.Command = "Finish"
            m.Response = m.Next + " has won!";
            msg, _ = json.Marshal(&m)
            socket.WriteMessage(msgType, msg);
            game.active = false
        }
    }
}

func main() {
    http.HandleFunc("/", handler)
    http.ListenAndServe(":4001", nil)
}
