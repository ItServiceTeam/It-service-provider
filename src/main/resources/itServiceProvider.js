var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, $http) {
    function checkIsNull(value) {
        return value === "" || value === undefined || value === null ? true : false;
    }
    $scope.isEligible = false;
    $scope.notificationCount = 0;
    $scope.schemeData = {};
    $scope.userName = localStorage.getItem("userName");
    $scope.currentUserDetails = localStorage.getItem("userDetails");
    $scope.loginUserType = localStorage.getItem("userType");
    $scope.currentUserDetails = JSON.parse($scope.currentUserDetails);
    $scope.imgBase64Data = '';
    $scope.schemeSubscriber = [];
    const URL = "https://fir-1c7de-default-rtdb.firebaseio.com/govtScheme";
    $scope.onload = function () {
        getSchemeDetailsData();
        $("#schemeDetailsDiv").hide();
        $("#appliedSchemeDiv").hide();
        $("#schemeSubscriberDiv").hide();
        $('#startDate').attr('min', new Date().toISOString().split('T')[0]);
        $('#endDate').attr('min', new Date().toISOString().split('T')[0]);
        if ($scope.loginUserType != 'COMPANY') {
            getNotication();
        }
    }

    $scope.addEditScheme = function () {
        if (checkIsNull($scope.schemeData.schemeName) ||
            checkIsNull($scope.schemeData.anualIncome) ||
            checkIsNull($scope.schemeData.minimumAge) ||
            checkIsNull($scope.schemeData.maximumAge) ||
            checkIsNull($scope.schemeData.startDate) ||
            checkIsNull($scope.schemeData.endDate) ||
            checkIsNull($scope.schemeData.applicableFor) ||
            checkIsNull($scope.schemeData.description)) {
            alert("Please fill all mandtory fields")
            return false;
        } else {

            let method_type = 'post';
            let http_url = URL + '/schemeDataList.json';
            if ($scope.isEdit) {
                delete $scope.schemeData["$$hashKey"];
                method_type = 'patch';
                http_url = URL + '/schemeDataList/' + $scope.schemeData.schemeId + '.json';
            }
            $scope.schemeData.startDate = $("#startDate").val();
            $scope.schemeData.endDate = $("#endDate").val();
            $.ajax({
                type: method_type,
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: http_url,
                data: JSON.stringify($scope.schemeData),
                success: function (response) {
                    getSchemeDetailsData();
                    alert("operation completed sucessfully!!!");
                    $scope.schemeData = {};
                    $("#startDate").val("");
                    $("#endDate").val("");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }

    function getSchemeDetailsData() {
        $scope.viewSchemeData = [];
        $scope.isEdit = false;
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/schemeDataList.json",
            success: function (response) {
                $scope.viewSchemeData = [];
                for (let i in response) {
                    let data = response[i];
                    data["schemeId"] = i;
                    $scope.viewSchemeData.push(data);
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.editSchemeDetails = function (event, details) {
        const isChecked = event.target.checked;
        $(".edit-check-cls").prop("checked", false);
        $(event.target).prop("checked", isChecked);
        $scope.schemeData = { ...details };
        if (!isChecked) {
            $scope.schemeData = {};
            $("#startDate").val("");
            $("#endDate").val("");
            $scope.isEdit = false;
        } else {
            $scope.isEdit = true;
            $scope.schemeData.schemeName = details.schemeName;
            $scope.schemeData.anualIncome = details.anualIncome;
            $scope.schemeData.minimumAge = details.minimumAge;
            $scope.schemeData.maximumAge = details.maximumAge;
            $scope.schemeData.startDate = details.startDate;
            $scope.schemeData.endDate = details.endDate;
            $scope.schemeData.applicableFor = details.applicableFor;
            $scope.schemeData.description = details.description;
            $("#startDate").val(details.startDate);
            $("#endDate").val(details.startDate);

        }
    }
    $scope.removeScheme = function (data) {

        $.ajax({
            type: 'delete',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + '/schemeDataList/' + data.schemeId + '.json',
            data: JSON.stringify($scope.schemeData),
            success: function (response) {
                getSchemeDetailsData();
                alert("operation completed sucessfully!!!");
                $scope.schemeData = {};
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.checkEligible = function (data) {
        $scope.selectedSchemeDetails = data;
        $scope.isEligible = true;
        if (($scope.currentUserDetails.incomeId < data.anualIncome) ||
            (data.applicableFor != 'A' && data.applicableFor != $scope.currentUserDetails.gender) ||
            ((data.minimumAge > $scope.currentUserDetails.dob) || ($scope.currentUserDetails.dob > data.maximumAge)) ||
            (new Date(data.startDate).getTime() > new Date().getTime()) ||
            (new Date().getTime() > new Date(data.endDate).getTime())) {

            $scope.isEligible = false;
        }
    }
    $scope.viewIdProof = function (data) {
        $scope.imgBase64Data = data.idProof;
    }
    $scope.applyScheme = function () {
        if (checkIsNull($scope.idProofDoc)) {
            alert("Please upload your id proof");
            return false;
        }
        let requestBody = {};
        delete $scope.selectedSchemeDetails["$$hashKey"];
        delete $scope.currentUserDetails["$$hashKey"];
        requestBody['idProof'] = $scope.idProofDoc;
        requestBody['schemeData'] = $scope.selectedSchemeDetails;
        requestBody['userData'] = $scope.currentUserDetails;
        requestBody['requestStatus'] = 'Pending';
        requestBody['comment'] = '';
        $.ajax({
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/applyScheme/" + $scope.currentUserDetails.userId + ".json",
            data: JSON.stringify(requestBody),
            success: function (response) {
                $("#eligibleModelId").modal('hide');
                $scope.switchMenu('VIEW-PENDING-SCHEME', 'viewPendingSchemeTabId');
                alert("Data submitted sucessfully!!!");
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }

    function getAppliedSchemeList() {
        let http_url = URL + "/applyScheme/.json";
        if ($scope.loginUserType != 'COMPANY') {
            http_url = URL + "/applyScheme/" + $scope.currentUserDetails.userId + ".json";
        }
        $scope.viewAppliedSchemeData = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: http_url,
            success: function (response) {
                $scope.viewAppliedSchemeData = [];
                $scope.viewSchemeSubscriber = [];
                if ($scope.loginUserType != 'COMPANY') {
                    for (let i in response) {
                        let data = response[i];
                        data["appliedSchemeId"] = i;
                        $scope.viewAppliedSchemeData.push(data);
                    }
                } else {
                    let viewAppliedSchemeData = [];
                    for (let i in response) {
                        for (let j in response[i]) {
                            let rdata = response[i][j];
                            rdata["appliedSchemeId"] = j;
                            viewAppliedSchemeData.push(rdata);
                        }

                    }
                    $scope.viewAppliedSchemeData = viewAppliedSchemeData.filter((obj) => obj.requestStatus === 'Pending');
                    $scope.viewSchemeSubscriber = viewAppliedSchemeData.filter((obj) => obj.requestStatus === 'Accepted');
                    $scope.getSchemeSubscriberList();
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.schemeAppliedData = function (data) {
        $("#commentId").val('');
        $scope.schemeAppliedData = data;
    }
    $scope.acceptRejectScheme = function (type, data) {
        let requestBody = {};
        if (type == 'Unsubscribed') {
            requestBody['requestStatus'] = 'Unsubscribed';
            $scope.schemeAppliedData = data;
        } else {

            if (checkIsNull($("#commentId").val())) {
                alert("Please add comment");
                return false;
            }
            if (type === 'ACCEPT') {
                requestBody['requestStatus'] = 'Accepted';
            } else {

                requestBody['requestStatus'] = 'Rejected';
                requestBody['comment'] = $("#commentId").val();
            }
        }

        $.ajax({
            type: 'patch',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/applyScheme/" + $scope.schemeAppliedData.userData.userId + "/" + $scope.schemeAppliedData.appliedSchemeId + ".json",
            data: JSON.stringify(requestBody),
            success: function (response) {
                $('#acceptRejectlId').modal('hide');
                getAppliedSchemeList();
                addNotification(type);
                alert("Data submitted sucessfully!!!");
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    function addNotification(type) {

        let requestBody = {};
        requestBody['hasViewed'] = false;
        requestBody['schemeName'] = $scope.schemeAppliedData.schemeData.schemeName;
        requestBody['comment'] = $("#commentId").val();
        if (type === 'ACCEPT') {
            requestBody['requestStatus'] = 'Accepted';
        } else if (type == 'Unsubscribed') {
            requestBody['requestStatus'] = 'Unsubscribed';
        } else {
            requestBody['requestStatus'] = 'Rejected';
        }

        $.ajax({
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/notification/" + $scope.schemeAppliedData.userData.userId + ".json",
            data: JSON.stringify(requestBody),
            success: function (response) {
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.dismissNotification = function (data) {
        let requestBody = {};
        requestBody['hasViewed'] = true;
        $.ajax({
            type: 'patch',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/notification/" + $scope.currentUserDetails.userId + "/" + data.notificationId + ".json",
            data: JSON.stringify(requestBody),
            success: function (response) {
                getNotication();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    function getNotication() {
        $scope.notificationCount = 0;
        const http_url = URL + "/notification/" + $scope.currentUserDetails.userId + ".json";
        $scope.viewNotificationData = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: http_url,
            success: function (response) {
                let viewNotificationData = [];
                for (let i in response) {
                    let data = response[i];
                    data["notificationId"] = i;
                    viewNotificationData.push(data);
                }
                $scope.viewNotificationData = viewNotificationData.filter(obj => !obj.hasViewed);
                $scope.notificationCount = $scope.viewNotificationData.length;
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.logout = function () {
        localStorage.removeItem("userId");
        localStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "itServiceProviderLogin.html";
    }
    $scope.setProfileDat = function () {
        $("#userNameId").val($scope.currentUserDetails.userName);
        $("#dobId").val($scope.currentUserDetails.dob);
        $("#userEmailId").val($scope.currentUserDetails.emailId);
        $("#passwordId").val($scope.currentUserDetails.password);
        $("#contactId").val($scope.currentUserDetails.contactNum);
        $("input[name=genderRadio][value=" + $scope.currentUserDetails.gender + "]").attr('checked', 'checked');
        $("#incomeId").val($scope.currentUserDetails.incomeId);
        $("#addressId").val($scope.currentUserDetails.addressId);
    }
    $scope.profileUpdate = function () {

        if (checkIsNull($("#userNameId").val()) || checkIsNull($("#dobId").val()) || checkIsNull($("#userEmailId").val())
            || checkIsNull($("#passwordId").val()) || checkIsNull($("#contactId").val()) || checkIsNull($("input[name='genderRadio']:checked").val())
            || checkIsNull($("#incomeId").val())) {
            alert("Please fill all the required data");
        } else {
            let requestBody = {
                "userName": $("#userNameId").val(),
                "dob": $("#dobId").val(),
                "dojId": $("#dojId").val(),
                "emailId": $("#userEmailId").val(),
                "password": $("#passwordId").val(),
                "contactNum": $("#contactId").val(),
                "incomeId": $("#incomeId").val(),
                "addressId": $("#addressId").val(),
                "gender": $("input[name='genderRadio']:checked").val()
            }
            $.ajax({
                type: 'patch',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                cache: false,
                url: URL + "/citizenRegister/" + $scope.currentUserDetails.userId + ".json",
                data: JSON.stringify(requestBody),
                success: function (lresponse) {
                    const userId = $scope.currentUserDetails.userId;
                    $scope.currentUserDetails = { ...requestBody };
                    $scope.currentUserDetails['userId'] = userId;
                    delete $scope.currentUserDetails['$$hashKey'];
                    localStorage.setItem("userDetails", JSON.stringify($scope.currentUserDetails));
                    $('#updateProfileId').modal('hide');
                    alert("Profile data updated sucessfully!!!");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }
    $scope.downloadPdf = function (id, fileName) {
        let divId = '#' + id;
        var doc = new jsPDF();
        var specialElementHandlers = {
            divId: function (element, renderer) {
                return true;
            }
        };
        var doc = new jsPDF();
        doc.fromHTML(
            $(divId).html(), 15, 15,
            { 'width': 170, 'elementHandlers': specialElementHandlers },
            function () { doc.save(fileName + '.pdf'); }
        );
    }
    $scope.getSchemeSubscriberList = function () {
        $scope.schemeSubscriber = [];
        $scope.viewSchemeData.forEach(element => {
            let schemeSubData = {};
            schemeSubData["details"] = [];
            schemeSubData["schemeName"] = element.schemeName;
            schemeSubData["details"] = $scope.viewSchemeSubscriber.filter(obj => obj.schemeData.schemeId === element.schemeId);
            $scope.schemeSubscriber.push(schemeSubData);
        });
        console.log($scope.schemeSubscriber);
    }

    $scope.switchMenu = function (type, id) {
        $(".menuCls").removeClass("active");
        $('#' + id).addClass("active");
        $("#appliedSchemeDiv").hide();
        $("#schemeDetailsDiv").hide();
        $("#schemeSubscriberDiv").hide();
        if (type == "VIEW-PENDING-SCHEME") {
            getAppliedSchemeList();
            //$("#appliedSchemeDiv").show();

        } else if (type == "VIEW-SCHEME") {
            $scope.schemeData = {};
            //$("#schemeDetailsDiv").show();
            getSchemeDetailsData();

        } else if (type == "VIEW-SCHEME-SUBSCRIBER") {
            getAppliedSchemeList();
            //$("#schemeSubscriberDiv").show();
        }
    }
    $(document).ready(function () {
        $('#idProofDoc').on('change', function () {
            var fileReader = new FileReader();
            fileReader.onload = function () {
                $scope.idProofDoc = fileReader.result;  // data <-- in this var you have the file data in Base64 format
            };
            fileReader.readAsDataURL($('#idProofDoc').prop('files')[0]);
            var file = $('#idProofDoc')[0].files[0].name;
            $(this).next('.custom-file-label').html(file);
        });
    });
});
