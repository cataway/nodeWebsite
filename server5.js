var http = require("http");
var fs = require("fs");
var url = require("url");
var querystring = require("querystring");
http.createServer(function (req, res) {
    if (req.method.toUpperCase() == "GET") {
        res.writeHead(200, {"Content-Type": "text/html;charset:utf-8"});
        var urlObj = url.parse(req.url, true);
        var pathname = urlObj.pathname;
        var str = fs.readFileSync("index5.html");
        if (pathname == "/") { //如果是根目录 http://localhost:8088
            res.end(str);
        } else if (pathname == "/data") {//http://localhost:8088/data,创建一个data.txt文件，将提交的数据，以键值对的方式，并且每一条信息以JSON格式的对象存在一个数组中
            var str = str.toString();
            var query = urlObj.query;
            var JSONquery = JSON.stringify(query);
            //获得到提交的数据后，存到data.txt文件中，先判断data.txt存在与否
            if (!fs.existsSync("data.txt")) { //data.txt不存在
                var a = [];
                query.id = 1; ////这是从浏览器端得到的查询字符串，给它添加id属性
                a.push(query);
                fs.writeFile("data.txt", JSON.stringify(a)); //创建data.txt，最终的data.txt是一个数组格式的文件[{"":"","":""...},{"":"","":""...},...]
            } else { //data.txt存在，表示原来保存过，将它读出来
                var strData = fs.readFileSync("data.txt").toString();//读data.txt，并将其转为字符串'{},{},...'
                var a = JSON.parse(strData);//将JSON格式字符串转化为数组对象[{},{},...]
                query.id = a.length + 1;
                a.push(query);
                fs.writeFile("data.txt", JSON.stringify(a));
            }
            //将提交的数据添加到页面中的div中显示，写回到网页中
            var strRes = "";
            strRes += "<ul>";
            for (var i = 0; i < a.length; i++) {
                strRes += "<li>" + JSON.stringify(a[i]) + "</li>";
            }
            strRes += "</ul>";
            var reg = /(<div id="message">)[\W\w]*?(<\/div>)/;
            str = str.replace(reg, "$1" + strRes + "$2");
            res.end(str); //这种做法，每提交一次，页面就整体刷新一次，性能不好，下面要做ajax局部刷新提交
        } else if (pathname == "/ajax") {
            var str = str.toString();
            var query = urlObj.query;
            var strData = fs.readFileSync("data.txt").toString(); //读取原来的data.txt
            try {
                var a = JSON.parse(strData); //把原来的数据读出来
            } catch (e) {
                var a = [];
            }
            query.id = a.length + 1;
            a.push(query);
            fs.writeFile("data.txt", JSON.stringify(a));
            res.end(str);

        } else if (pathname == "favicon.ico") {
            console.log("404");
        } else {
            console.log("路过的!");
        }
    }
}).listen(8088, function () {
    console.log("sucess start!");
})