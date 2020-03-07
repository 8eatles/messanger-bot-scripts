const scriptName="teaching.js";

/**
 * Settings
 */ 
const settings = {
    debug: true,
    dbPrefix: 'teaching/',
    cmdPrefix: '/',
    kSeparator: '@',
    vSeparator: '|',
    pageLimit: 5,
};

/**
 * Constants
 */
const helpMsg = '';

/**
 * Commands
 */
const commands = {
    '가르치기': function (cmd, msg, room, sender, isGroupChat) {
        // key start with command prefix
        if (msg.startsWith(settings.cmdPrefix)) {
            return '\'' + settings.cmdPrefix + '\'로 시작하는 키워드는 등록 할 수 없습니다.';
        }

        const key = msg.split(settings.kSeparator)[0];
        const valueString = msg.substring(key.length + 1);

        // number of value < 1
        if (!valueString || valueString.length === 0) {
            return '잘못된 사용 입니다.\n사용법:\n\t'
            + settings.cmdPrefix + cmd + ' 키워드' + settings.kSeparator + '내용\n\t'
            + settings.cmdPrefix + cmd + ' 키워드' + settings.kSeparator + '내용1'
            + settings.vSeparator + '내용2' + settings.vSeparator + '내용3 ...';
        }

        let count = 0;

        const dbPath = settings.dbPrefix + '/' + room + '/' + key;
        const originData = DataBase.getDataBase(dbPath);
        const data = originData ? JSON.parse(originData) : [];

        valueString.split(settings.vSeparator).forEach(function(value) {
            if (value && value.trim().length != 0) {
                data.push({ msg: value, author: sender });
                count += 1;
            }
        });
        DataBase.setDataBase(dbPath, JSON.stringify(data));

        // return dbPath + '\n' + JSON.stringify(data) + '\n' + DataBase.getDataBase(dbPath);
        return '\'' + key + '\' 에 대한 학습이 ' + count + '개 추가되었습니다. (Total: ' + data.length + ')';
    },
    '학습제거': function (cmd, msg, room, sender, isGroupChat) {
        const key = msg.split(settings.kSeparator)[0];
        const idString = msg.substring(key.length + 1);
        const dbPath = settings.dbPrefix + '/' + room + '/' + key;

        const savedData = DataBase.getDataBase(dbPath);

        if (!savedData) {
            return '\'' + key + '\' 에 대한 학습데이터가 존재하지 않습니다.'
        }

        const data = JSON.parse(savedData);

        if (!idString || idString.length === 0) {
            // Delete all
            return '잘못된 사용 입니다.\n사용법:\n\t'
            + settings.cmdPrefix + cmd + ' 키워드' + settings.kSeparator + 'all\n\t'
            + settings.cmdPrefix + cmd + ' 키워드' + settings.kSeparator + 'id';
        } else if (idString === 'all') {
            DataBase.removeDataBase(dbPath);
            return '\'' + key + '\'에 대한 모든 학습을 잊었습니다.';
        } else {
            const id = parseInt(msg.substring(key.length + 1), 10);
            const removedData = data[id];
            data.splice(id, 1);
            DataBase.setDataBase(dbPath, JSON.stringify(data));
            return '\'' + key + '\'의 ' + removedData.msg + ' 내용을 잊었습니다.';
        }
        return cmd + ':' + msg;
    },
    '학습내역': function (cmd, msg, room, sender, isGroupChat) {
        const key = msg.split(settings.kSeparator)[0];
        const pageString = msg.substring(key.length + 1);
        const page = pageString && pageString.length !== 0 ? parseInt(msg.substring(key.length + 1), 10) : 1;
        const limit = settings.pageLimit;
        const dbPath = settings.dbPrefix + '/' + room + '/' + key;

        const savedData = DataBase.getDataBase(dbPath);

        if (!savedData) {
            return '\'' + key + '\' 에 대한 학습데이터가 존재하지 않습니다.'
        }

        const data = JSON.parse(savedData);

        const maxPage = Math.ceil(data.length / limit);

        if (page < 1 || page > maxPage) {
            return '페이지 범위가 초과하였습니다.(1~' + maxPage + ')';
        }

        let message = '-- \'' + key + '\' 에 대한 학습 내역 --\n';

        for (let i = (page - 1) * limit; i < page * limit && i < data.length; i++) {
            message += '[ID: ' + i + ', Author: ' + data[i].author + ']\n' + data[i].msg + '\n';
        }

        message += '-- Page (' + page + '/' + maxPage + ') --';

        return message;
    },
    '학습명령어': function (cmd, msg, room, sender, isGroupChat) {
        return helpMsg;
    },
}

/**
 * Message Listener
 */
function response(room, msg, sender, isGroupChat, replier, ImageDB, packageName, threadId)
{
    // Is Command, (settings.cmdPrefix)로 시작
    if (msg.startsWith(settings.cmdPrefix)) {
        try {
            // Array.prototype.some()은  return true 일 때 break 함.
            Object.keys(commands).some(function (cmd) {
                // 지정한 command가 호출되었는지 검사 (뒤에 Space 한칸 까지 검사)
                if (msg.substring(1).startsWith(cmd + ' ')) {
                    const result = commands[cmd](cmd, msg.substring(cmd.length + 2), room, sender, isGroupChat);
                    replier.reply(result);
                    return true;
                }
            })
        } catch (error) {
            if (settings.debug) {
                replier.reply('DEBUG: ' + error.message)
            }
        }
    } else {
        try {
            const dbPath = settings.dbPrefix + '/' + room + '/' + msg;
            const savedData = JSON.parse(DataBase.getDataBase(dbPath));
            if (savedData && savedData.length > 0) {
                const randomIndex = Math.floor(Math.random() * savedData.length);
                const selected = savedData[randomIndex];
                replier.reply(selected.msg + '\n\n by ' + selected.author);
            }
        }
        catch (error) {
            if (settings.debug) {
                replier.reply('DEBUG: ' + error.message)
            }
        }
    }
}

//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState,activity) {
    var layout=new android.widget.LinearLayout(activity);
    layout.setOrientation(android.widget.LinearLayout.HORIZONTAL);
    var txt=new android.widget.TextView(activity);
    txt.setText("액티비티 사용 예시입니다.");
    layout.addView(txt);
    activity.setContentView(layout);
}
function onResume(activity) {}
function onPause(activity) {}
function onStop(activity) {}
