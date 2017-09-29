cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        this.player = this.node.getChildByName('player');
        this.loadMap();

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    onKeyDown:function(event){
        var newTile = cc.p(this.playerTile.x, this.playerTile.y);
        switch(event.keyCode) {
            case cc.KEY.up:
                newTile.y -= 1;
                break;
            case cc.KEY.down:
                newTile.y += 1;
                break;
            case cc.KEY.left:
                newTile.x -= 1;
                break;
            case cc.KEY.right:
                newTile.x += 1;
                break;
            default:
                return;
        }
        this.tryMoveToNewTile(newTile);
    },

    //加载地图文件时调用
    loadMap: function () {
        //初始化地图位置
        this.node.setPosition(cc.visibleRect.bottomLeft);
        //地图
        this.tiledMap = this.node.getComponent(cc.TiledMap);
        //players对象层
        let players = this.tiledMap.getObjectGroup('players');
        //startPoint和endPoint对象
        let startPoint = players.getObject('startPoint');
        let endPoint = players.getObject('endPoint');
        //像素坐标
        let startPos = cc.p(startPoint.offset.x, startPoint.offset.y);
        let endPos = cc.p(endPoint.offset.x, endPoint.offset.y);
        //障碍物图层和星星图层
        this.barriers = this.tiledMap.getLayer('barriers');
        this.stars = this.tiledMap.getLayer('stars');
        //出生Tile和结束Tile
        this.playerTile = this.startTile = this.getTilePos(startPos);
        this.endTile = this.getTilePos(endPos);
        //更新player位置
        this.updatePlayerPos();
    },

    tryMoveToNewTile: function(newTile) {
        let width = this.tiledMap.node.width;
        let height = this.tiledMap.node.height;
        if (newTile.x < 0 || newTile.x >= width) return;
        if (newTile.y < 0 || newTile.y >= height) return;

        if (this.barriers.getTileGIDAt(newTile)) {//GID=0,则该Tile为空
            cc.log('This way is blocked!');
            return false;
        }

        this.tryCatchStar(newTile);

        this.playerTile = newTile;
        this.updatePlayerPos();

        if (cc.pointEqualToPoint(this.playerTile, this.endTile)) {
            cc.log('succeed');
        }
    },

    tryCatchStar: function(newTile){
        let GID = this.stars.getTileGIDAt(newTile);
        let prop = this.tiledMap.getPropertiesForGID(GID);

        if (this.stars.getTileGIDAt(newTile)) {//GID=0,则该Tile为空
            this.stars.removeTileAt(newTile);
        }

        // if(prop && prop.isStar)
        // {
        //     this.stars.removeTileAt(newTile);
        // }
    },

    //将像素坐标转化为瓦片坐标
    getTilePos: function(posInPixel) {
        let mapSize = this.node.getContentSize();
        let tileSize = this.tiledMap.getTileSize();
        let x = Math.floor(posInPixel.x / tileSize.width);
        let y = Math.floor(posInPixel.y / tileSize.height);
        return cc.p(x, y);
    },

    updatePlayerPos: function() {
        let pos = this.barriers.getPositionAt(this.playerTile);
        this.player.setPosition(pos);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
