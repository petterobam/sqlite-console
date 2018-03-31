package my.sqlite.console.controller;

import my.sqlite.console.entity.MyAjaxResult;
import my.sqlite.console.entity.MyConsole;
import my.sqlite.console.service.MyConsoleService;
import my.sqlite.utils.SqliteUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Controller
public class MainController {
    /**
     * 主页
     * @return
     */
    @RequestMapping("/")
    public String index() {
        return "/index";
    }

    /**
     * 执行sql
     * @param myConsole
     * @return
     */
    @RequestMapping("/excute")
    public @ResponseBody MyAjaxResult excute(@RequestBody MyConsole myConsole) {
        MyAjaxResult result = new MyAjaxResult();
        MyConsoleService service = new MyConsoleService(myConsole);
        service.excute(myConsole);
        result.setResult(myConsole);
        return result;
    }

    /**
     * 获取数据库集
     * @param myConsole
     * @param model
     * @return
     */
    @PostMapping("/find/dbs")
    public @ResponseBody MyAjaxResult getDbs(@RequestBody MyConsole myConsole, ModelMap model) {
        MyAjaxResult result = new MyAjaxResult();
        MyConsoleService service = new MyConsoleService(myConsole);
        List<String> dbs = service.getDbs(myConsole);
        result.setResult(dbs);
        return result;
    }
    /**
     * 获取数据库集
     * @param myConsole
     * @return
     */
    @PostMapping("/find/tables")
    public @ResponseBody MyAjaxResult getTables(@RequestBody MyConsole myConsole) {
        MyAjaxResult result = new MyAjaxResult();
        String dbPath = myConsole.getDbPath();
        if(!SqliteUtils.isBlank(dbPath)){
            dbPath =dbPath.replaceAll("\\\\","/");
            while (dbPath.indexOf("//") >= 0){
                dbPath = dbPath.replaceAll("//","/");
            }
        }
        myConsole.setDbPath(dbPath);
        MyConsoleService service = new MyConsoleService(myConsole);
        String [] tableNameArr = service.getTableNameArr();
        result.setResult(tableNameArr);
        return result;
    }
}
