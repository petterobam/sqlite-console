package my.sqlite.console.utils;

import my.sqlite.utils.SqliteUtils;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;

public class SqliteConloseUtils {
    /**
     * 获取目录下的所有数据库集合
     * @param absolute
     * @param path
     * @return
     * @throws Exception
     */
    public static ArrayList<String> getSqliteDbNames(Boolean absolute,String path) {
        //目标集合fileList
        ArrayList<String> sqliteDbNameArr = new ArrayList<String>();
        File file = null;
        if(null == absolute || !absolute){
            path = SqliteUtils.getClassRootPath(path);
        }
        file = new File(path);
        if(!file.exists()){
            return sqliteDbNameArr;
        }
        if (file.isDirectory()) {
            File[] files = file.listFiles();
            if(null == files || files.length == 0){
                return sqliteDbNameArr;
            }
            for (File fileIndex : files) {
                //如果这个文件是目录，则进行递归搜索
                if (!fileIndex.isDirectory() && fileIndex.getName().endsWith(".db")) {
                    sqliteDbNameArr.add(fileIndex.getName());
                }
            }
        }else if(file.getName().endsWith(".db")){
            sqliteDbNameArr.add(file.getName());
        }
        return sqliteDbNameArr;
    }
}
