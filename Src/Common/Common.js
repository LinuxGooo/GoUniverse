"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     09.06.2016
 * Time     1:24
 */

var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g;
function SplitTextToLines(sText)
{
	var aLines = [];

	var nBreakPos = -1;
	var nCurPos   = 0;

	for (var nCount = sText.length; nBreakPos < nCount; ++nBreakPos)
	{
		var nCharCode = sText.charCodeAt(nBreakPos);
		if (0x000A === nCharCode || 0xFF0A === nCharCode)
		{
			aLines.push(sText.substr(nCurPos, nBreakPos - nCurPos));
			nCurPos = nBreakPos + 1;
		}
	}

	if (nCurPos < sText.length)
		aLines.push(sText.substr(nCurPos, sText.length - nCurPos));

	for (var nIndex = 0, nCount = aLines.length; nIndex < nCount; ++nIndex)
	{
		aLines[nIndex] = aLines[nIndex].replace(urlRegEx, "<a href='$1' target='_blank'>$1</a>");
	}

	return aLines;
}

function CFadeEffect()
{
	this.m_oElements = [];
}
CFadeEffect.prototype.In = function(oElement, nTime, fOnDisplay)
{
	if (!oElement)
		return;

	if (parseFloat(oElement.style.opacity) > 0.99 && "none" !== oElement.style.display)
		return;

	var nOldDirection = this.private_CheckElement(oElement);
	if (-1 === nOldDirection)
		this.private_RemoveElement(oElement);
	else if (1 === nOldDirection)
		return;

	oElement.style.opacity    = 0;
	oElement.style.filter     = "alpha(opacity=0)";
	oElement.style.display    = "inline-block";
	oElement.style.visibility = "visible";

	if (fOnDisplay)
		fOnDisplay();

	if (nTime > 0)
	{
		var oThis    = this;
		var dOpacity = 0;
		var nTimerId = setInterval(function()
		{
			dOpacity += 50 / nTime;
			if (dOpacity >= 1)
			{
				oThis.private_RemoveElement(oElement);
				dOpacity = 1;
			}
			oElement.style.opacity = dOpacity;
			oElement.style.filter  = "alpha(opacity=" + dOpacity * 100 + ")";
		}, 50);

		this.private_AddElement(oElement, nTimerId, 1);
	}
	else
	{
		oElement.style.opacity = 1;
		oElement.style.filter  = "alpha(opacity=1)";
	}
};
CFadeEffect.prototype.Out = function(oElement, nTime, fOnHidden)
{
	if (!oElement)
		return;

	if (parseFloat(oElement.style.opacity) < 0.01 && "none" === oElement.style.display)
		return;

	var nOldDirection = this.private_CheckElement(oElement);
	if (1 === nOldDirection)
		this.private_RemoveElement(oElement);
	else if (-1 === nOldDirection)
		return;

	if (nTime > 0)
	{
		var dOpacity = 1;
		var oThis = this;
		var nTimerId = setInterval(function()
		{
			dOpacity -= 50 / nTime;
			if (dOpacity <= 0)
			{
				oThis.private_RemoveElement(oElement);
				dOpacity                  = 0;
				oElement.style.display    = "none";
				oElement.style.visibility = "hidden";

				if (fOnHidden)
					fOnHidden();
			}
			oElement.style.opacity = dOpacity;
			oElement.style.filter  = "alpha(opacity=" + dOpacity * 100 + ")";
		}, 50);

		this.private_AddElement(oElement, nTimerId, -1);
	}
	else
	{
		oElement.style.opacity    = 0;
		oElement.style.filter     = "alpha(opacity=0)";
		oElement.style.display    = "none";
		oElement.style.visibility = "hidden";
	}
};
CFadeEffect.prototype.private_RemoveElement = function(oElement)
{
	for (var nIndex = 0, nCount = this.m_oElements.length; nIndex < nCount; ++nIndex)
	{
		if (this.m_oElements[nIndex].Element === oElement)
		{
			clearInterval(this.m_oElements[nIndex].TimerId);
			this.m_oElements.splice(nIndex, 1);
			return;
		}
	}
};
CFadeEffect.prototype.private_AddElement = function(oElement, nTimerId, nDirection)
{
	this.m_oElements.push({
		Element   : oElement,
		TimerId   : nTimerId,
		Direction : nDirection
	});
};
CFadeEffect.prototype.private_CheckElement = function(oElement)
{
	for (var nIndex = 0, nCount = this.m_oElements.length; nIndex < nCount; ++nIndex)
	{
		if (this.m_oElements[nIndex].Element === oElement)
			return this.m_oElements[nIndex].Direction;
	}

	return 0;
};

var g_oFadeEffect = new CFadeEffect();

function CTimeStamp(sTimeStamp)
{
	this.m_oDate = new Date();

	if (sTimeStamp)
		this.Parse(sTimeStamp);
}
CTimeStamp.prototype.Parse = function(sTimeStamp)
{
	// <YYYY-MM-DDTHH:mm:ss.sssZ>
	this.m_oDate = new Date(Date.parse(sTimeStamp));
};
CTimeStamp.prototype.ToLocaleString = function()
{
	return this.m_oDate.toLocaleString();
};
CTimeStamp.prototype.GetDifferenceString = function()
{
	var nTime = this.m_oDate.getTime();
	var nCurTime = (new Date()).getTime();

	var nDiffTime = nCurTime - nTime;

	var nSeconds = parseInt(nDiffTime / 1000);

	if (nSeconds <= 60 * 2)
	{
		return "" + nSeconds + " seconds ago";
	}
	else if (nSeconds <= 3600 * 2)
	{
		var nMinutes = Math.floor(nSeconds / 60);
		return nMinutes + " minutes ago";
	}
	else if (nSeconds <= 3600 * 24 * 2)
	{
		var nMinutes = Math.floor(nSeconds / 60);
		var nHours   = Math.floor(nMinutes / 60);
		return nHours + " hours ago";
	}
	else
	{
		var nMinutes = Math.floor(nSeconds / 60);
		var nHours   = Math.floor(nMinutes / 60);
		var nDays    = Math.floor(nHours / 24);
		return nDays + " days ago";
	}
};

