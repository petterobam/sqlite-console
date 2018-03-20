package my.sqlite.console.service;

import my.sqlite.base.SqliteBaseService;
import my.sqlite.console.dao.MyUserDao;
import my.sqlite.console.entity.MyUser;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;

@Service
public class MyUserService extends SqliteBaseService<MyUser, MyUserDao> {
    public MyUserService() {
        super(MyUserDao.class);
    }

    /**
     * 检查用户名是否已经被用过
     *
     * @param name
     * @return
     */
    public boolean checkNameUsed(String name) {
        MyUser query = new MyUser();
        query.setName(name);
        int count = super.count(query);
        if (count > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 通过用户名和密码获取用户信息
     *
     * @param name
     * @param password
     * @return
     */
    public MyUser getByNameAndPassword(String name, String password) {
        MyUser query = new MyUser();
        query.setName(name);
        query.setMD5Password(password);
        List<MyUser> list = query(query);
        if (CollectionUtils.isEmpty(list)) {
            return null;
        } else {
            return list.get(0);
        }
    }
}
