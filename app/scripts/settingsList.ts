interface BasicSetting {
    "name": string,
    "title"?: string,
    "description"?: string,
    "instantDescription"?: string,
    "type": "boolean"|"number"|"range"|"text"|"textarea"|"select",
    "default": boolean|string|number,
    "isInstantChangable": boolean,
    "range"?: number[],
    "selections"?: (string|number)[]
}
interface BooleanSetting extends BasicSetting {
    "type": "boolean",
    "default": boolean,
}
interface NumberSetting extends BasicSetting {
    "type": "number",
    "default": number,
    "range"?: number[]
}
interface RangeSetting extends BasicSetting {
    "type": "range",
    "default": number,
    "range"?: number[]
}
interface TextSetting extends BasicSetting {
    "type": "text",
    "default": string,
}
interface TextareaSetting extends BasicSetting {
    "type": "textarea",
    "default": string,
}
interface SelectSetting extends BasicSetting {
    "type": "select",
    "default": string|number,
    "selections": (string|number)[]
}
export type Setting = BooleanSetting|NumberSetting|RangeSetting|TextSetting|TextareaSetting|SelectSetting
export interface SettingList {
    "description": string,
    "header"?: string,
    "footer"?: string,
    "instantHeader"?: string,
    "instantFooter"?: string,
    "settings": Setting[]
}
export const settings: SettingList[] = [
    {
        "description" : "映像・表示・操作関連設定",
        "settings": [
            {
                "name": "isResizeScreen",
                //        "description": "ウィンドウサイズに合わせて映像の端が切れないようにリサイズ(コメ欄開いた時映像の大きさは変わらずコメ欄にかぶります。)",
//                "description": "映像をウィンドウに合わせてリサイズ、映像の位置を上に詰める (映像がウィンドウ外にはみ出なくなり、コメ欄などを開いても映像の大きさは変わらず映像の上に重なります。)",
                "description": "映像をウィンドウに合わせてリサイズし、縮小させない (コメ欄などを開いても映像が縮まず、映像の上に重なります。) ◆",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isDAR43",
                "description": "映像4:3用の処理を使用する(左右の黒帯部分を無視して映像の最大化を行います)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isMovieSpacingZeroTop",
                "description": "映像の上下位置を上に詰める",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isResizeSpacing",
                "description": "映像の上下位置を上に詰めるが、メニューの分だけ少し空ける",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isMovieSpacingZeroLeft",
                "description": "映像の左右位置を左に詰める(「映像をウィンドウに合わせてリサイズ」でコメントを映像にかぶせたくないときに便利です。)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isDblFullscreen",
                "description": "ダブルクリックで全画面表示に切り替え＆全画面ボタンをF11相当のフルスクリーンに割り当て(コメント欄を表示したまま全画面にできます。)◆",
                //"instantDescription": "ダブルクリックで全画面表示に切り替え",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isCancelWheel",
                //        "description": "マウスホイールによる番組移動を禁止する",
                "description": "マウスホイール及び上下矢印キーによる番組移動を無効化する",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isVolumeWheel",
                //        "description": "マウスホイールによる番組移動を音量操作へ変更する",
                "description": "マウスホイールで音量を操作する（&番組移動無効化）",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "changeMaxVolume",
                "description": "音量が最大(100)の場合は以下へ自動変更する",
                "type": "number",
                "isInstantChangable": true,
                "default": 100,
                "range": [0, 100]
            },
            {
                "name": "isHideButtons",
                "description": "全画面ボタンと音量ボタンを非表示",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isHideTwitterPanel",
                "description": "パネル「twitterで通知を受け取る」を非表示",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isHideTodayHighlight",
                "description": "右上の「今日のみどころ」を放送中画面で非表示(このオプションはトップページには効きません)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isHideVoting",
                "description": "アンケート(投票機能)を非表示",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isStoreViewCounter",
                "description": "コメント欄開閉ボタンのコメント数の上に視聴数をコピーする",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "panelOpacity",
                "description": "上下黒帯パネルの透過度(完全透明0～255不透明)",
                "type": "range",
                "isInstantChangable": true,
                "default": 127,
                "range": [0,255]
            },
            {
                "name": "audibleReloadWait",
                "description": "音声の再生が停止してから自動的にタブを更新するまでの秒数",
                "type": "number",
                "isInstantChangable": true,
                "default": 20
            }
        ]
    },
    {
        "description": "映像解像度設定(実験的)",
        "header": "この設定はabemaの映像取得に介入して無理やり解像度を変えるため不具合が生じる可能性があり、あまり推奨できません。もし映像が映らなくなったり不具合が生じればこの設定をデフォルト(最小0最大2160)に戻してみてください。<br>",
        "footer": "デフォルトの最小=0,最大=2160に設定すると解像度変更は動作しません。映像が映らなくなったらデフォルトに戻してください。",
        "settings": [
            {
                "name": "minResolution",
                "description": "最小解像度",
                "type": "select",
                "selections": [0, 180, 240, 360, 480],
                "isInstantChangable": true,
                "default": 0
            },
            {
                "name": "maxResolution",
                "description": "最大解像度",
                "type": "select",
                "selections": [180, 240, 360, 480, 720, 1080, 2160],
                "isInstantChangable": true,
                "default": 2160
            }
        ]
    },
    {
        "description": "コメント欄関連設定",
        "settings": [
            {
                "name": "isHideOldComment",
                "description": "コメント欄のスクロールバーを非表示にする",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isInpWinBottom",
                "description": "<s>コメント入力欄を下へ(コメント一覧は逆順・下スクロール)</s>公式で最新コメントが下に来るようになったのでこの設定は無視されます。(廃止予定)",
                "type": "boolean",
                "isInstantChangable": false,//無視するためにfalse
                "default": false
            },
            {
                "name": "isCustomPostWin",
                //        "description": "投稿ボタン削除・入力欄1行化",
                "description": "投稿ボタン等を非表示",
                "type": "boolean",
                //        "isInstantChangable": false
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isSureReadComment",
                //        "description": "常にコメント欄を表示する",
                "description": "常にコメント欄を開こうとする(開閉が制限されている時は開けません)(設定時に右下のコメント数クリックで入力欄を残してコメント欄を閉じれます) ◇★",
                "type": "boolean",
                //        "isInstantChangable": false
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isCommentFormWithSide",
                "description": "↑有効時にコメント入力欄を右のボタンと連動して非表示(画面右のボタンがマウス無操作時に非表示になる場合、合わせて入力欄も非表示になります)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isComeTriming",
                "description": "↑常にコメント欄を表示するような場合にコメント欄が上下に縮まないように上下黒帯を横に縮める",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "sureReadRefreshx",
                //        "description": "読込済コメント数がx(101以上)を超えた時にコメ欄を閉じる(再度開く時に100以降の古いコメントが破棄される)",
                //        "description": "常にコメント欄を表示する場合で、読込済コメント数がx(101以上)を超えた時にコメ欄を閉じる(再度開く時に100以降の古いコメントが破棄される)",
                "description": "<s>常にコメント欄を表示する場合で、</s>読込済コメント数がx(101以上)を超えた時にコメ欄を閉じる(直ちに開き直され、100以前の古いコメントが破棄されることで動作が軽くなります。重いときは少なくすると軽くなります。)",
                "type": "number",
                "isInstantChangable": true,
                "default": 500,
                "range": [101,]
            },
            {
                "name": "isCommentPadZero",
                "description": "コメントの縦の隙間を詰める",
                "instantDescription": "コメントの縦の隙間を詰める(一時適応すると今までのコメントが消えます)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isCommentTBorder",
                "description": "コメントの区切り線を付ける",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isCommentWide",
                "description": "コメントを横にほんの少し広げる",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isDelOldTime",
                "description": "<s>古いコメントの投稿時刻の表示を非表示にする。</s>現在機能しません。",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isDelTime",
                "description": "各コメントの投稿時刻を全て非表示にする。",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "highlightComePower",
                "description": "新着コメント強調の強度",
                "type": "number",
                "isInstantChangable": true,
                "default": 30
            },
            {
                "name": "isUserHighlight",
                "description": "コメントにマウスオーバーで同一ユーザーのコメントの背景を黄色くする(同一人物のコメントを見分けるのに便利です。コメ欄にNG設定を適応させてない場合、新着コメントには効きません。)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            }
        ]
    },
    {
        "description": "コメント流し関連設定",
        "settings": [
            {
                "name": "isMovingComment",
                "description": "新着コメントをあの動画サイトのように横に流す(コメント欄を開いているときのみ有効、コメント欄関連設定の「常にコメント欄を開こうとする」を同時に有効にすると常にコメントが流れるのでおすすめです。) ◇★(重くなることがあります)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "movingCommentSecond",
                "description": "↑のコメントの速さ(コメントが画面を流れる秒数、小さいほど速い)",
                "type": "number",
                "isInstantChangable": true,
                "default": 8,
                "range": [1,]
            },
            {
                "name": "movingCommentLimit",
                "description": "↑のコメントの同時表示上限",
                "type": "number",
                "isInstantChangable": true,
                "default": 50,
                "range": [0,]
            },
            {
                "name": "kakikomiwait",
                "description": "自分のコメントを流すまでの待ち時間(秒)マイナスだと流れない",
                "type": "number",
                "isInstantChangable": true,
                "default": 0
            },
            {
                "name": "comeMovingAreaTrim",
                "description": "コメントを流す領域の横幅を、ウィンドウ全体でなく映像の横幅に合わせる",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "comeFontsize",
                "description": "流れるコメントの文字の大きさ(px)",
                "type": "number",
                "isInstantChangable": true,
                "default": 32,
                "range": [1,99]
            },
            {
                "name": "comeFontsizeV",
                "description": "流れるコメントの文字の大きさをウィンドウ縦長さに追従させる",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            }
        ]
    },
    {
        "description": "コメントNG関連設定",
        "header": "コメントのワードNG、ユーザーNGを利用したいときはそれぞれ「指定した〜流さない」を有効にしてください。また、「<b>NG設定を右コメント一覧にも適用する</b>」も忘れずに有効にしてください。ユーザーNG追加には「コメント一覧クリックでNG追加欄を表示」も必要です。<br>",
        "settings": [
            {
                "name": "isComeNg",
                "description": "流れるコメントから規定の単語を除去(顔文字,連続する単語など)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isDeleteStrangeCaps",
                "description": "↑に加えて、一般的な文字以外を全て削除する(英数字や漢字、ひらがな、一部の記号などは削除されません)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isComeDel",
                "description": "指定した単語が含まれるコメントは流さない(ワードNG)(「NG設定をコメント一覧にも適用する」も有効にしないとコメント欄には反映されません) ◇☆",
                "type": "boolean",
                "isInstantChangable": true,
                "default": true
            },
            {
                "name": "fullNg",
                "description": "NGワード(1行1つ、/正規表現/も可、//コメント)",
                "type": "textarea",
                "isInstantChangable": true,
                "default": ""
            },
            {
                "name": "isUserDel",
                "description": "指定したユーザーIDのコメントを流さない(ユーザーNG)(「NG設定をコメント一覧にも適用する」も有効にしないとコメント欄には反映されません。それと同時に「コメント一覧クリックでNG追加欄を表示」を有効にするとコメント欄からNG登録できます。) ◇☆",
                "type": "boolean",
                "isInstantChangable": true,
                "default": true
            },
            {
                "name": "userNg",
                "description": "流さないユーザーID(1行1つ)",
                "type": "textarea",
                "isInstantChangable": true,
                "default": ""
            },
            {
                "name": "isShareNGword",
                "description": "<a href='https://abema.nakayuki.net/ngshare/' target='_blank'>共有NGワード</a>を有効にする(実験的)(追加したNGワードがサーバーに送信され、追加数の多いワードが自動で一時的なNGワードに設定されます。)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isShareNGuser",
                "description": "共有NGユーザーを有効にする(実験的)(追加したNGユーザーIDがサーバーに送信され、追加数の多いIDが自動で一時的なNGユーザーに設定されます。)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isComelistNG",
//                "description": "NG設定を右コメント一覧にも適用する(流れるコメント用のNG設定がそのまま一覧にも適用されます。ただし、一覧のコメント表示数は直近100件まで、投稿時刻は新着のみ表示となります。)",
                "description": "この設定は無視され、常に右のコメ欄にもNGが適用されます。<s>NG設定を右コメント一覧にも適用する(これを有効にしないと流れるコメントにしかNGが効きません。ただし、一覧のコメント表示数は直近100件までとなります。)コメントを選択し、右クリックNGワード追加できます。 ◇☆</s>",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isComelistClickNG",
//                "description": "コメント一覧クリックでNG追加欄を表示(このNG追加欄による保存は一時的です。永久保存は設定画面へ。)",
                "description": "コメント一覧クリックでNG追加欄を表示<s>(「NG設定を右コメント一覧にも適用する」も有効にしてください。)</s>(NGボタン1回クリックで一時保存(黄色)、短時間で2回クリックすると永久保存(赤色)になります。)",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isComeClickNGautoClose",
                "description": "↑でNG登録後、自動的にNG追加欄を閉じる",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            }
        ]
    },
    {
        "description": "コメントのMastodon投稿設定",
        "header": "ホストとトークンを設定するとコメント欄の投稿ボタンの横にMastodonアイコンが追加されます。そのアイコンをクリックして切り替えてください。コメント欄関連設定で「投稿ボタン等を非表示」にしているとアイコンが表示されませんのでMastodon投稿を有効にできません。<br>",
        "footer": "<input type='button' id='getMastodonTokenBtn' value='認証してトークンを取得'><span id='authCodeArea'></span>",
        "instantHeader": "",
        "settings": [
            {
                "name": "mastodonInstance",
                "description": "Mastodonインスタンスのホスト(mstdn.jpやpawoo.netやfriends.nicoなど)",
                "type": "text",
                "default": "",
                "isInstantChangable": false
            },
            {
                "name": "mastodonToken",
                "description": "Mastodon APIトークン(ホストを入力後下のボタンから取得できます、認証後画面のコードとは別物です)",
                "instantDescription": "Mastodon APIトークン",
                "type": "text",
                "default": "",
                "isInstantChangable": false
            },
            {
                "name": "mastodonFormat",
                "description": "トゥート内容フォーマット({comment}はコメント本文、{onairpage}は放送ページのURL、\\nは改行)",
                "type": "text",
                "default": "{comment}\\n#AbemaTV\\n{onairpage}",
                "isInstantChangable": true
            }
        ]
    },
    {
        "description": "番組時間・タイトル表示関連設定",
        "settings": [
            {
                "name": "isTimeVisible",
                //        "description": "コメント入力欄の近くに番組残り時間を表示",
                //        "description": "画面右上に番組残り時間を表示",
                "description": "番組残り時間を表示 ◆",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isProtitleVisible",
                "description": "番組タイトルを表示 ◆",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "isProTextLarge",
                "description": "番組残り時間・タイトルの文字を大きくする",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            },
            {
                "name": "proTitleFontC",
                "description": "表示位置がコメント入力欄周辺の場合、番組残り時間・タイトルの文字色と残り時間バーの色をコメント欄に合わせる",
                "type": "boolean",
                "isInstantChangable": true,
                "default": false
            }
        ]
    },
    {
        "description": "番組通知関連設定",
        "settings": [
            {
                "name": "notifySeconds",
                "description": "番組通知を番組開始の何秒前にするか(番組表の番組ページから番組開始前の通知を設定できます。)",
                "type": "number",
                "isInstantChangable": true,
                "default": 60
            },
            {
                "name": "isNotifyAndOpen",
                "description": "番組通知時に自動で新しいタブで放送画面を開く ◆",
                "type": "boolean",
                "isInstantChangable": false,
                "default": false
            },
            {
                "name": "isNaOinActive",
                "description": "↑既に開いている放送画面があれば新しいタブを開かずそのタブを切り替える(アクティブなタブ優先)",
                "type": "boolean",
                "isInstantChangable": false,
                "default": false
            },
            {
                "name": "isNotifyRemain",
                "description": "通知を自動で消さない(消すかクリックするまで通知ポップアップが消えないようにする)",
                "type": "boolean",
                "isInstantChangable": false,
                "default": false
            },
            {
                "name": "isNotifySound",
                "description": "通知時に音を鳴らす",
                "type": "boolean",
                "isInstantChangable": false,
                "default": false
            },
            {
                "name": "isNotifyOnline",
                "description": "<a href='https://abema.nakayuki.net/notify/' target='_blank'>メールやLINE Notify等による通知</a>を有効にする(実験的)(ブラウザを起動していない時に便利です。以下をいずれか設定した内容が通知登録時にサーバーに送信されます。)",
                "type": "boolean",
                "isInstantChangable": false,
                "default": false
            },
            {
                "name": "notifyOnlineMinutes",//これ関係の設定はonairpage.jsでは変数代入も含めて完全ノータッチ
                "description": "↑を番組開始の何分前に通知するか",
                "type": "number",
                "isInstantChangable": false,
                "default": 5
            },
            {
                "name": "notifyMailAddress",
                "description": "↑の通知先メールアドレス",
                "type": "text",
                "default": "",
                "isInstantChangable": false
            },
            {
                "name": "notifyLNtoken",
                "description": "↑の通知先LINE Notifyのトークン <a href='https://abema.nakayuki.net/notify/#getLNtoken' target='_blank'>取得方法</a>",
                "type": "text",
                "default": "",
                "isInstantChangable": false
            },
            {
                "name": "notifyPostUrl",
                "description": "↑の通知POST先URL (slackのincoming webhookも設定可)",
                "type": "text",
                "default": "",
                "isInstantChangable": false
            }
        ],
        "footer": "上の3つの通知先の内、必要分を設定してください。正しく設定されていないと通知登録に失敗します。新しい設定は設定変更後の通知登録から反映されます。"
    },
    {
        "description": "番組表関連設定",
        "settings": [
            {
            //    "name": "isChTimetableExpand",
            //    "description": "<s>チャンネル別番組表ページにて、番組タイトルの末尾が隠れないように枠を縦に広げる (時刻の縦の長さが一定でなくバラバラになります)</s>古いオプションで正常に動かないので無効",
            //    "type": "boolean",
            //    "isInstantChangable": false
            //},{
                "name": "isChTimetableBreak",
//                "description": "チャンネル別番組表ページにて、番組タイトルの改行位置を変更する (2桁の話数が改行よって数字1字ずつに分かれたりするのを防止)",
                "description": "番組表ページにて、番組タイトルの改行位置を変更する (2桁の話数が改行よって数字1字ずつに分かれたりするのを防止)",
                "type": "boolean",
                "isInstantChangable": false,
                "default": false
            },{
                "name": "isChTimetableWeekend",
                "description": "チャンネル別番組表ページにて、土曜を青、日曜を赤に着色する",
                "type": "boolean",
                "isInstantChangable": false,
                "default": true
            },{
                "name": "isChTimetablePlaybutton",
                "description": "各番組表ページに、放送中画面への直接リンクを設置する (丸型の再生ボタンの場合、番組詳細画面が一瞬だけ表示されます) ◆",
                "type": "boolean",
                "isInstantChangable": false,
                "default": true
            },{
                "name": "timetableScroll",
                "description": "番組表を開いたときに指定したチャンネルまで自動スクロール(abema-news、drama、anime24などのurl中のチャンネル名を一つ指定)",
                "type": "text",
                "default": "",
                "isInstantChangable": false
            },{
                "name": "allowChannelNames",
                "description": "番組表で表示するチャンネル名を半角カンマ区切り(番組表を指定したチャンネルのみの表示にできます)(番組表で各チャンネルリンクの右クリックメニューやチャンネル一覧のチェックボックスから切替可)",
                "type": "text",
                "default": "",
                "isInstantChangable": false
            },{
                "name": "isExpandLastItem",
                "description": "番組表の一番下(日付変更付近)の細いマスを縦に少し伸ばしてちゃんと見えるようにする",
                "type": "boolean",
                "isInstantChangable": false,
                "default": false
            },{
                "name": "isExpandFewChannels",
                "description": "番組表に左右余白がある場合、各チャンネル列を横に伸ばす",
                "type": "boolean",
                "isInstantChangable": false,
                "default": false
            },{
                "name": "isHideArrowButton",
                "description": "番組表の横移動ボタンを非表示",
                "type": "boolean",
                "isInstantChangable": false,
                "default": false
            },{
                "name": "isPutSideDetailHighlight",
                "description": "番組表の右枠に詳細文を追加する(番組表本体の枠内に記載がある場合のみ)",
                "type": "boolean",
                "isInstantChangable": false,
                "default": true
            }, {
                "name": "isReplaceIcons",
                "description": "番組表のタイトルに付いているアイコンを開始時刻(分)の下へ移動",
                "type": "boolean",
                "isInstantChangable": false,
                "default": false
            }
        ]
    }
];
export const comeColorSettings: Setting[] = [
    {
        "name": "commentBackColor",
        "description": "コメント一覧の背景色(黒0～灰～255白)",
        "type": "range",
        "isInstantChangable": true,
        "default": 255
    },
    {
        "name": "commentBackTrans",
        "description": "コメント一覧の背景の透明度(完全透明0～255不透明)",
        "type": "range",
        "isInstantChangable": true,
        "default": 191
    },
    {
        "name": "commentTextColor",
        "description": "コメントの文字色(黒0～灰～255白)",
        "type": "range",
        "isInstantChangable": true,
        "default": 0
    },
    {
        "name": "commentTextTrans",
        "description": "コメントの文字の透明度(完全透明0～255不透明)",
        "type": "range",
        "isInstantChangable": true,
        "default": 255
    }
    ];
export interface RadioSetting {
    "name": string,
    "type": string,
    "list": (string|number)[][][],
    "default": string|number,
    "range"?: any//エラー押さえ込み
}
export const radioSettings: RadioSetting[] = [
    {
        "name": "timePosition",
        "type": "radio",
        "list":[
            [["windowtop","ウィンドウの右上（常時表示）"]],
            [["windowbottom","ウィンドウの右下（常時表示）"]],
            [["commentinputtop","コメント入力の右上"]],
            [["commentinputbottom","コメント入力の右下"]],
            [["header","右上のメニューの上"]],
            [["footer","右下のコメント数の下"]]
        ],
        "default": "windowtop"
    },
    {
        "name": "protitlePosition",
        "type": "radio",
        "list":[
            [
                ["windowtopleft","ウィンドウの左上（常時表示）"],
                ["windowtopright","ウィンドウの右上（常時表示）"]
            ],[
                ["windowbottomleft","ウィンドウの左下（常時表示）"],
                ["windowbottomright","ウィンドウの右下（常時表示）"]
            ],[
                ["commentinputtopleft","コメント入力の左上"],
                ["commentinputtopright","コメント入力の右上"]
            ],[
                ["commentinputbottomleft","コメント入力の左下"],
                ["commentinputbottomright","コメント入力の右下"]
            ],[
                ["headerleft","左上のアイコンの上"],
                ["headerright","右上のメニューの上"]
            ],[
                ["footerleft","左下のアイコンの下"],
                ["footerright","右下のコメント数の下"]
            ]
        ],
        "default": "windowtopleft"
    },{
        "name": "proSamePosition",
        "type": "radio",
        "list":[[
                ["over","重ねる"],
                ["vertical","縦"],
                ["horizontal","横(コメ欄周辺で無効)"],
                ["horizshort","タイトルを少し左へ"]
            ]],
        "default": "over"
    },{
        "name": "panelopenset",
        "type": "radio",
        "list":[[[255879,"デフォルト"],[531440,"常に表示"],[531441,"カスタム"]]],
        "default": 255879
    },{
        "name": "highlightNewCome",
        "type": "radio",
        "list":[[
                [0,"なし"],
                [1,"先頭マーク"],
                [2,"背景着色"],
                [3,"両方"]
        ]],
        "default": 0
    },{
        "name": "highlightComeColor",
        "type": "radio",
        "list":[[
                [0,"黄"],
                [1,"橙"],
                [2,"赤"],
                [3,"桃"],
                [4,"紫"],
                [5,"青"],
                [6,"水"],
                [7,"緑"],
                [8,"白"],
                [9,"黒"]
        ]],
        "default": 0
    }
    ];
export const CMSettings: Setting[] = [
    {
        "name": "isCMBlack",
        "description": "コメント数が表示されないとき画面真っ黒",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "isCMBkTrans",
        "description": "↑を下半分だけ少し透かす",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "isCMBkR",
        "description": "↑を映像クリックで解除・再適用する",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "isCMsoundoff",
//            "description": "コメント数が表示されないとき音量ミュート",
        "description": "コメント数が表示されないときプレイヤーの音量ミュート",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "isTabSoundplay",
        "description": "↑をプレイヤーでなくchromeタブ設定でミュートにする",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "isCMsoundR",
        "description": "↑を映像クリックで解除・再適用する",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "CMsmall",
//            "description": "コメント数が表示されないとき映像部分を1/xに縮小する",
        "description": "コメント数が表示されないとき映像部分を100%(縮小なし)～5%に縮小する",
        "type": "number",
        "isInstantChangable": true,
        "default": 100
    },
    {
        "name": "isCMsmlR",
        "description": "↑を映像クリックで解除・再適用する",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "beforeCMWait",
        "description": "コメント数が表示されなくなってから↑実行までの待機時間",
        "type": "number",
        "isInstantChangable": true,
        "default": 0
    },
    {
        "name": "afterCMWait",
        "description": "コメント数が表示されてから↑解除までの待機時間",
        "type": "number",
        "isInstantChangable": true,
        "default": 0
    },
    {
        "name": "isManualKeyCtrlR",
        "description": "↑の待機中、右ctrlを押している間は実行しない（離すと即実行）",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "isManualKeyCtrlL",
        "description": "↑の待機中、左ctrlを押している間は実行しない（離すと即実行）",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "isManualMouseBR",
        "description": "↑の待機中、画面右下のコメ数表示部に1.2秒以上連続でカーソルを合わせている間は実行しない（カーソルを外すと即実行）",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "useEyecatch",
        "description": "左上ロゴのタイミングに合わせる",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "isHidePopTL",
        "description": "左上に出てくるロゴを非表示",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "isHidePopBL",
        "description": "左下に出てくる通知を非表示",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    },
    {
        "name": "isHidePopFresh",
        "description": "左下に出てくるFresh告知を非表示",
        "type": "boolean",
        "isInstantChangable": true,
        "default": false
    }
];
