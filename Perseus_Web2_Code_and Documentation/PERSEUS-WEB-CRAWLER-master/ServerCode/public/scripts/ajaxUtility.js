/*****************************************
Author: Gregory Niebanck
Date:	4/8/2017
Description: functions for basic asynchronous 
get and post requests usable in any application
****************************************/


/********************************************************************
                         makePostReq
description: Abstraction of a generic post request which then executes a function using the returned data
		as paramteres
first parameter is the data to send via post
second paramerter is the url of the server route
third parameter is the function to execute on the return data 
*******************************************************************/
function makePostReq(dataToSend, targetUrl, postCallBack)
{
	var returnedData;
	var req = new XMLHttpRequest();
	req.open('POST', targetUrl,true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.addEventListener('load',function()
	{
		if(req.status >= 200 && req.status < 400)
		{
			returnedData = (req.response);
			postCallBack(returnedData);
		}
		else
		{
			console.log("Error in network request: " + req.statusText);
		}
	});
	req.send(JSON.stringify(dataToSend));
}
/***************************************************************************
 *			makeGetReq
 *description: Abstraction of a generic get request
 *
 * first parameter is an array of strings formated to "parameter=value" 
 * second parameter is the  url of the server route
 *
 * ****************************************************************************/
function makeGetReq(dataArray, baseReqString, getCallBack)
{
	
	var reqString = baseReqString + "?";
	for(i in dataArray)
	{
		reqString = reqString + dataArray[i] + "&";
	}
	reqString = reqString.substr(0,(reqString.length - 1));
	var req = new XMLHttpRequest();
	req.open('GET',reqString, true);
	req.setRequestHeader('Content-Type','application/json');
	req.addEventListener('load',function()
	{
		if(req.status >= 200 && req.status < 400)
		{
			getCallBack(req.responseText);
		}
		else 
		{
			console.log("Error in network request: " + req.statusText);
		}});
	req.send(null);
}


