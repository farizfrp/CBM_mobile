

const DARK_MODE = {
    PRIMARY: '#454343',
    SECONDARY: '#2e2b2b',
    WHITE: '#FFFFFF',
    BLACK: '#000000',
 
    // ACTIONS
    SUCCESS: '#7EC693',
    WARNING: '#FC8338',
    ALERT: '#FF0000',
    SKY: '#388BF2',

    GREEN:"#008000",
    BLUE:"#114D96",
    CHOCOLATE:"#d2691e",
    GREY: '#808080',
    YELLOW:'#d19e1d',
    PURPLE:"#8a1e74",
    GREYLIGHTS:"#778899",
    // TEXT
    TEXT_PRIMARY: '#FFFFFF',
    TEXT_SECONDARY: '#A0A4A8'

}

const LIGHT_MODE = {
    PRIMARY: '#A0A4A8',
    SECONDARY: '#FFFFFF',
    WHITE: '#FFFFFF',
    BLACK: '#000000',

    // ACTIONS
    SUCCESS: '#7EC693',
    WARNING: '#FC8338',
    ALERT: '#FF8379',
    SKY: '#388BF2',
    
    GREEN:"#008000",
    BLUE:"#114D96",
    CHOCOLATE:"#d2691e",
    GREY: '#808080',
    YELLOW:'#d19e1d',
    PURPLE:"#8a1e74",
    GREYLIGHTS:"#778899",
    // TEXT
    TEXT_PRIMARY: '#000000',
    TEXT_SECONDARY: '#808080'

}
const mode ="DARK"
const Color = {

            PRIMARY,
            SECONDARY,
            WHITE,
            BLACK,

            SUCCESS,
            WARNING,
            ALERT,

            GREEN,
            BLUE,
            CHOCOLATE,
            YELLOW,
            PURPLE,

            GREYLIGHTS,
            GRAY_DARK,
            GRAY_MEDIUM,
            TEXT_PRIMARY,
            TEXT_SECONDARY
        } 
        = mode=="DARK"?DARK_MODE:LIGHT_MODE
   
    
  


export default Color;
