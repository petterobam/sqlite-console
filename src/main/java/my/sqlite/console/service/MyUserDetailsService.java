package my.sqlite.console.service;

import my.sqlite.console.entity.MyUser;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.HashSet;
import java.util.Set;

/**
 * 获取登陆用户的详细信息
 *
 * @author 欧阳洁
 */
@Service
public class MyUserDetailsService implements UserDetailsService {
    /**
     * 验证码是否启用,默认启用
     */
    @Value("${web.verify-code.enabled:true}")
    private Boolean captchaEnabled;
    /**
     * 服务
     */
    @Autowired
    private MyUserService userSecurity;

    /**
     * request
     */
    @Autowired
    protected HttpServletRequest request;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if(StringUtils.isBlank(username)){
            username = (String) request.getSession().getAttribute("name");
        }
        if (StringUtils.isBlank(username)) {
            throw new UsernameNotFoundException("用户名为空");
        }
        if (captchaEnabled) {
            String code = request.getParameter("verifyCode");
            if (StringUtils.isBlank(code)) {
                throw new UsernameNotFoundException("验证码不能为空");
            }
            String verifyCode = (String) request.getSession().getAttribute("verifyCode");
            ;
            if (verifyCode == null) {
                throw new UsernameNotFoundException("验证码已失效");
            }
            if (!code.equalsIgnoreCase(verifyCode)) {
                throw new UsernameNotFoundException("验证码错误");
            }
        }
        MyUser info = null;
        try {
            String password = request.getParameter("password");
            info = userSecurity.getByNameAndPassword(username, password);
        } catch (Exception e) {
            throw new UsernameNotFoundException("用户名或密码错误");
        }
        if(null == info){
            throw new UsernameNotFoundException("用户名或密码错误");
        }
        Set<GrantedAuthority> authorities = new HashSet<GrantedAuthority>();
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("USER");
        authorities.add(authority);
        User user = new User(username, info.getPassword(),
                true, // 是否可用
                true, // 是否过期
                true, // 证书不过期为true
                true, // 账户未锁定为true
                authorities);
        return user;
    }
}
