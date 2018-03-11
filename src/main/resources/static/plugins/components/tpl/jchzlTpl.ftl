<div class="vetech-tab">
    <div class="vtitle">${title}</div>
    <span class="close"></span>
    <div class="tab-header">
        <ul class="clearfix">
            <#list tabs as tab>
                <li class="tab"><a href="javascript:;" data-index="{{i}}">{{tab.text}}</a></li>
            </#list>
        </ul>
    </div>
    <div class="tab-content hotAirport clearfix">
        <#list hotList as hotItem>
            <dl class="clearfix">
                <dd>
                    <ul class="clearfix">
                        <#list hotItem.items as hot>
                            <li class="item">
                                <a href="javascript:;" class="ellipsis hot" id="${hot.nbbh}">
                                    ${hot.hzlqm}
                                </a>
                            </li>
                        </#list>
                    </ul>
                </dd>
            </dl>
        </#list>
    </div>
    <#list contentList as content>
        <div class="tab-content">
            <#--<#list content.groups as ></#list>-->
            {{# for(var j = 0 , len2 = d.list[i].groups.length; j < len2; j++ ){ }}
            <dl class="clearfix">
                {{# if(d.list[i].groups[j].gName){ }}
                <dt>{{d.list[i].groups[j].gName}}</dt>
                {{# } }}
                <dd>
                    <ul class="clearfix">
                        {{# for(var k = 0, len3 = d.list[i].groups[j].items.length; k < len3; k++){ }}
                        <li class="item">
                            <a href="javascript:;" class="ellipsis" id="{{d.list[i].groups[j].items[k][d.simpleData.id]}}" title="{{d.list[i].groups[j].items[k][d.simpleData.name]}}">
                                {{d.list[i].groups[j].items[k][d.simpleData.name]}}
                            </a>
                        </li>
                        {{# } }}
                    </ul>
                </dd>
            </dl>
            {{# } }}
        </div>
    </#list>
</div>
