package my.sqlite.console.controller;

import com.google.code.kaptcha.impl.DefaultKaptcha;
import my.sqlite.console.entity.MyAjaxResult;
import my.sqlite.console.utils.SqliteConloseUtils;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.thymeleaf.util.StringUtils;

import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

@Controller
public class LoginController {
    /**
     * 日志工具
     */
    private org.slf4j.Logger logger = LoggerFactory.getLogger(LoginController.class);
    @Autowired
    private DefaultKaptcha defaultKaptcha;
    /**
     * request
     */
    @Autowired
    protected HttpServletRequest request;
    /**
     * 注入response
     */
    @Autowired
    protected HttpServletResponse response;

    /**
     * Login string.
     *
     * @param model 存储数据到页面
     * @return the string
     */
    @RequestMapping(value = "/login", method = RequestMethod.GET)
    public String login(Model model) {
        String serverName = request.getServerName();
        String ip = SqliteConloseUtils.getRemoteIp(request);
        logger.info("打开登录页面时是获取的访问地址是{},访问来源是{}", serverName, ip);
        model.addAttribute("ServerName", serverName);
        model.addAttribute("RemoteAddr", ip);
        //此处创建Session是为了保证验证码和登录页获取的session保持一致
        request.getSession(true);
        //移除验证码
        request.getSession().removeAttribute("verifyCode");
        return "/login/index";
    }

    /**
     * 验证码获取链接
     * @throws Exception
     */
    @RequestMapping("/login/verifyCode")
    public void verifyCode() throws Exception {
        byte[] captchaChallengeAsJpeg = null;
        ByteArrayOutputStream jpegOutputStream = new ByteArrayOutputStream();
        try {
            //生产验证码字符串并保存到session中
            String createText = defaultKaptcha.createText();
            request.getSession().setAttribute("verifyCode", createText);
            //使用生产的验证码字符串返回一个BufferedImage对象并转为byte写入到byte数组中
            BufferedImage challenge = defaultKaptcha.createImage(createText);
            ImageIO.write(challenge, "jpg", jpegOutputStream);
        } catch (IllegalArgumentException e) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        //定义response输出类型为image/jpeg类型，使用response输出流输出图片的byte数组
        captchaChallengeAsJpeg = jpegOutputStream.toByteArray();
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
        response.setContentType("image/jpeg");
        ServletOutputStream responseOutputStream = response.getOutputStream();
        responseOutputStream.write(captchaChallengeAsJpeg);
        responseOutputStream.flush();
        responseOutputStream.close();
    }

    /**
     * 验证验证码
     *
     * @param verifyCode 传入的验证码
     * @return 返回验证结果
     */
    @ResponseBody
    @RequestMapping("/login/verifyCodeCheck")
    public MyAjaxResult verifyCodeCheck(@RequestParam("verifyCode") String verifyCode) {
        MyAjaxResult result = new MyAjaxResult();
        String verifyCodeReal = String.valueOf(request.getSession().getAttribute("verifyCode"));
        if (!StringUtils.equalsIgnoreCase(verifyCodeReal,verifyCode)) {
            result.setErrorMsg("验证码错误");
            result.setStatus(MyAjaxResult.FAIL);
            request.getSession().removeAttribute("verifyCode");
        }
        return result;
    }
}
