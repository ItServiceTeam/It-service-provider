var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, $http) {
    function checkIsNull(value) {
        return value === "" || value === undefined || value === null ? true : false;
    }
    $scope.isEligible = false;
    $scope.notificationCount = 0;
    $scope.serviceData = {};
    $scope.userName = localStorage.getItem("userName");
    $scope.currentUserDetails = localStorage.getItem("userData");
    $scope.loginUserType = localStorage.getItem("userType");
    $scope.currentUserDetails = JSON.parse($scope.currentUserDetails);
    $scope.imgBase64Data = '';
    $scope.schemeSubscriber = [];
    const URL = "https://fir-1c7de-default-rtdb.firebaseio.com/itServiceProvider";
    $scope.onload = function () {
        $scope.gtServiceDetailsData("ADMIN");
        $("#appliedServiceDiv").hide();
        $("#serviceDetailsDiv").hide();
        $("#viewCompanyDiv").hide();
        $("#comunicationDivId").hide();
        $("#feedBackDivId").hide();
        $("#applicationsDiv").hide();
        $("#viewServiceSummaryDiv").hide();
        $('#startDate').attr('min', new Date().toISOString().split('T')[0]);
        $('#endDate').attr('min', new Date().toISOString().split('T')[0]);
        if ($scope.loginUserType != 'COMPANY') {
            getCompanyList();
            $("#appliedServiceDiv").show();
        } else {
            $("#serviceDetailsDiv").show();
        }
    }

    $scope.serviceAddEdit = function () {
        if (checkIsNull($scope.serviceData.serviceName) ||
            checkIsNull($scope.serviceData.serviceCharges) ||
            checkIsNull($scope.serviceData.serviceType) ||
            checkIsNull($scope.serviceData.description)) {
            alert("Please fill all mandtory fields")
            return false;
        } else {

            let method_type = 'post';
            let http_url = URL + '/serviceDataList/' + $scope.currentUserDetails.userId + '/.json';
            if ($scope.isEdit) {
                delete $scope.serviceData["$$hashKey"];
                method_type = 'patch';
                http_url = URL + '/serviceDataList/' + $scope.currentUserDetails.userId + '/' + $scope.serviceData.serviceId + '.json';
            }
            $.ajax({
                type: method_type,
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: http_url,
                data: JSON.stringify($scope.serviceData),
                success: function (response) {
                    $scope.gtServiceDetailsData("ADMIN");
                    alert("operation completed sucessfully!!!");
                    $scope.serviceData = {};
                    $('#serviceAddEditModelId').modal('hide');
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }

    $scope.gtServiceDetailsData = function (data) {
        let url = "";
        if (data == 'ADMIN') {
            url = URL + "/serviceDataList/" + $scope.currentUserDetails.userId + "/.json";
        } else {
            $scope.selectedComapnyDetails = data;
            url = URL + "/serviceDataList/" + data.userId + "/.json";
        }
        $scope.viewServiceData = [];
        $scope.isEdit = false;
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: url,
            success: function (response) {
                $scope.viewServiceData = [];
                for (let i in response) {
                    let data = response[i];
                    data["serviceId"] = i;
                    $scope.viewServiceData.push(data);
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.editServiceDetails = function (event, details) {
        const isChecked = event.target.checked;
        $(".edit-check-cls").prop("checked", false);
        $(event.target).prop("checked", isChecked);
        $scope.serviceData = { ...details };
        if (!isChecked) {
            $scope.serviceData = {};
            $scope.isEdit = false;
        } else {
            $scope.isEdit = true;
            $scope.serviceData.serviceName = details.serviceName;
            $scope.serviceData.serviceCharges = details.serviceCharges;
            $scope.serviceData.serviceType = details.serviceType;
            $scope.serviceData.description = details.description;

        }
    }
    $scope.isAddService = function (isAdd) {
        $scope.isEdit = !isAdd;
    }
    $scope.removeService = function () {
        $.ajax({
            type: 'delete',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + '/serviceDataList/' + $scope.currentUserDetails.userId + '/' + $scope.serviceData.serviceId + '.json',
            data: JSON.stringify($scope.serviceData),
            success: function (response) {
                $scope.gtServiceDetailsData('ADMIN');
                alert("Removed sucessfully!!!");
                $scope.serviceData = {};
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.selectedApplyService = function (data) {
        $('#startDate').attr('min', new Date().toISOString().split('T')[0]);
        $('#endDate').attr('min', new Date().toISOString().split('T')[0]);
        $scope.serviceData = data;
    }
    $scope.applyService = function () {
        if (new Date($('#startDate').val()).getTime() > new Date($('#endDate').val()).getTime()) {
            alert("End Service should be greater than Start Service")

        } else if (checkIsNull($('#startDate').val()) || checkIsNull($('#endDate').val())) {
            alert("Please select date");

        } else {
            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            const firstDate = new Date($('#startDate').val());
            const secondDate = new Date($('#endDate').val());
            const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
            const totalCost = ($scope.serviceData.serviceCharges / 30) * diffDays;
            $("#costId").val(totalCost);
            let requestBody = {};
            delete $scope.currentUserDetails["$$hashKey"];
            delete $scope.selectedComapnyDetails["$$hashKey"];
            delete $scope.serviceData["$$hashKey"];
            requestBody['companyData'] = $scope.selectedComapnyDetails;
            requestBody['userData'] = $scope.currentUserDetails;
            requestBody['requestStatus'] = 'Pending';
            requestBody['cost'] = $("#costId").val();
            requestBody['serviceData'] = $scope.serviceData;
            $.ajax({
                type: 'post',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + "/applyService/" + $scope.currentUserDetails.userId + ".json",
                data: JSON.stringify(requestBody),
                success: function (response) {
                    $("#applyServiceModalId").modal('hide');
                    $scope.switchMenu('VIEW-APPLICANT', 'viewApplicantTabId')
                    alert("Data submitted sucessfully!!!");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }
    function getAppliedServicesData() {
        let http_url = URL + "/applyService/.json";
        if ($scope.loginUserType != 'COMPANY') {
            http_url = URL + "/applyService/" + $scope.currentUserDetails.userId + ".json";
        }
        $scope.viewAppliedServiceData = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: http_url,
            success: function (response) {
                $scope.viewAppliedServiceData = [];
                $scope.viewAppliedServiceSummeryData = [];
                if ($scope.loginUserType != 'COMPANY') {
                    for (let i in response) {
                        let data = response[i];
                        data["appliedserviceId"] = i;
                        $scope.viewAppliedServiceData.push(data);
                    }
                } else {
                    let viewAppliedServiceData = [];
                    let viewAppliedServiceSummeryData = [];
                    for (let i in response) {
                        for (let j in response[i]) {
                            let rdata = response[i][j];
                            rdata["appliedserviceId"] = j;
                            viewAppliedServiceData.push(rdata);
                        }

                    }
                    $scope.viewAppliedServiceData = viewAppliedServiceData.filter((obj) => obj.companyData.userId === $scope.currentUserDetails.userId);
                    viewAppliedServiceSummeryData = [...$scope.viewAppliedServiceData];
                    viewAppliedServiceSummeryData.forEach((obj) => {
                        if ((new Date(obj.serviceData.startDate).getTime() < new Date().getTime()) &&
                            (new Date(obj.serviceData.endDate).getTime() > new Date().getTime())) {
                            obj["subscribeStatus"] = "Active";

                        } else if ((new Date(obj.serviceData.startDate).getTime() > new Date().getTime())) {
                            obj["subscribeStatus"] = "Upcomming";

                        } else if (new Date(obj.serviceData.endDate).getTime() < new Date().getTime()) {
                            obj["subscribeStatus"] = "Expired";
                        }
                    })
                    $scope.viewAppliedServiceSummeryData = [...viewAppliedServiceSummeryData];
                    $scope.viewAppliedServiceSummeryFilterData = $scope.viewAppliedServiceSummeryFilterData = $scope.viewAppliedServiceSummeryData.filter(obj => obj.requestStatus == "Payment Completed");
                    // $scope.viewServiceSubscriber = viewAppliedServiceData.filter((obj) => obj.requestStatus === 'Accepted');
                    // $scope.getServiceSubscriberList();
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.askQuestions = function (data, index) {
        if (checkIsNull($("#questionBoxId-" + index).val())) {
            alert("Please enter your question");
        } else {
            let requestBody = {};
            delete $scope.currentUserDetails["$$hashKey"];
            delete data["$$hashKey"];
            requestBody["customerDetails"] = $scope.currentUserDetails;
            requestBody["question"] = $("#questionBoxId-" + index).val();
            requestBody["companyDetails"] = data;
            requestBody["answer"] = "";

            $.ajax({
                type: 'post',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + '/questionsAnswerList.json',
                data: JSON.stringify(requestBody),
                success: function (response) {
                    $("#questionBoxId-" + index).val('');
                    $scope.getQuestionAnsData();
                    alert("Question has posted!!!");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }
    $scope.answerUpdate = function (data, index) {
        if (checkIsNull($("#answerBoxId-" + index).val())) {
            alert("Please enter your question");
        } else {
            let requestBody = {};
            requestBody["answer"] = $("#answerBoxId-" + index).val();

            $.ajax({
                type: 'patch',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + '/questionsAnswerList/' + data.queriesId + '/.json',
                data: JSON.stringify(requestBody),
                success: function (response) {
                    $("#answerBoxId-" + index).val('');
                    $scope.getQuestionAnsData();
                    alert("Answer has posted!!!");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }
    $scope.getQuestionAnsData = function () {
        $scope.queriesList = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/questionsAnswerList.json",
            success: function (response) {
                let queriesList = [];
                for (let i in response) {
                    let data = response[i];
                    data["queriesId"] = i;
                    queriesList.push(data);
                }
                if ($scope.loginUserType == 'COMPANY') {
                    $scope.queriesList = queriesList.filter(obj => obj.companyDetails.userId === $scope.currentUserDetails.userId);
                } else {
                    $scope.queriesList = queriesList.filter(obj => obj.customerDetails.userId === $scope.currentUserDetails.userId);
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.feedBack = function (data, index) {
        if (checkIsNull($("#feedbackBoxId-" + index).val())) {
            alert("Please enter your comment");
        } else {
            let requestBody = {};
            delete data["$$hashKey"];
            requestBody["feedback"] = $("#feedbackBoxId-" + index).val();
            requestBody["rating"] = $("#ratingId-" + index).val();
            requestBody["details"] = data;

            $.ajax({
                type: 'post',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + '/feedBackList.json',
                data: JSON.stringify(requestBody),
                success: function (response) {
                    $("#questionBoxId-" + index).val('');
                    $scope.getQuestionAnsData();
                    alert("Feedback has posted!!!");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }

    function getFeedBackData() {
        $scope.feedBackList = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/feedBackList.json",
            success: function (response) {
                let feedBackList = [];
                for (let i in response) {
                    let data = response[i];
                    data["feedBackId"] = i;
                    feedBackList.push(data);
                }
                if ($scope.loginUserType == 'COMPANY') {
                    $scope.feedBackList = feedBackList.filter(obj => obj.details.companyDetails.userId === $scope.currentUserDetails.userId);
                } else {
                    $scope.feedBackList = [...feedBackList];
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }

    $scope.viewServices = function (data) {
        $scope.selectedCompanyDetails = data;
    }
    function getCompanyList() {
        $scope.companyList = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/itServiceRegister.json",
            success: function (response) {
                let loginUserList = [];
                for (let i in response) {
                    let data = response[i];
                    data["userId"] = i;
                    loginUserList.push(data);
                }
                $scope.companyList = loginUserList.filter(obj => obj.userType === 'Company');
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });

    }

    $scope.acceptRejectPayment = function (data, type) {
        let requestBody = {};
        if (type === 'ACCEPT') {
            requestBody['requestStatus'] = 'Accepted';
        } else if (type == 'PAY') {
            requestBody['requestStatus'] = 'Payment Completed'
        } else {

            requestBody['requestStatus'] = 'Rejected';
        }

        $.ajax({
            type: 'patch',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/applyService/" + data.userData.userId + "/" + data.appliedserviceId + ".json",
            data: JSON.stringify(requestBody),
            success: function (response) {
                getAppliedServicesData();
                alert("Data submitted sucessfully!!!");
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

    $scope.getServiceSubscriberList = function () {
        $scope.schemeSubscriber = [];
        $scope.viewSchemeData.forEach(element => {
            let schemeSubData = {};
            schemeSubData["details"] = [];
            schemeSubData["schemeName"] = element.schemeName;
            schemeSubData["details"] = $scope.viewServiceSubscriber.filter(obj => obj.schemeData.serviceId === element.serviceId);
            $scope.schemeSubscriber.push(schemeSubData);
        });
        console.log($scope.schemeSubscriber);
    }
    $scope.filter = function (modelValue) {
        $scope.viewAppliedServiceSummeryFilterData = [];
        if (modelValue == 'ALL') {
            $scope.viewAppliedServiceSummeryFilterData = $scope.viewAppliedServiceSummeryData.filter(obj => obj.requestStatus == "Payment Completed");
        } else if (modelValue == 'ACTIVE') {
            $scope.viewAppliedServiceSummeryFilterData = $scope.viewAppliedServiceSummeryData.filter(obj => obj.subscribeStatus == 'Active' && obj.requestStatus == "Payment Completed");

        } else if (modelValue == 'EXPIRED') {
            $scope.viewAppliedServiceSummeryFilterData = $scope.viewAppliedServiceSummeryData.filter(obj => obj.subscribeStatus == 'Expired' && obj.requestStatus == "Payment Completed");

        } else if (modelValue == 'UPCOMMING') {
            $scope.viewAppliedServiceSummeryFilterData = $scope.viewAppliedServiceSummeryData.filter(obj => obj.subscribeStatus == 'Upcomming' && obj.requestStatus == "Payment Completed");

        }
    }
    $scope.switchMenu = function (type, id) {
        $(".menuCls").removeClass("active");
        $('#' + id).addClass("active");
        $("#viewCompanyDiv").hide();
        $("#serviceDetailsDiv").hide();
        $("#comunicationDivId").hide();
        $("#appliedServiceDiv").hide();
        $("#feedBackDivId").hide();
        $("#applicationsDiv").hide();
        $("#viewServiceSummaryDiv").hide();

        if (type == "SERVICE") {
            $("#serviceDetailsDiv").show();
            $scope.gtServiceDetailsData('ADMIN');

        } else if (type === "VIEW-COMPANY") {
            getCompanyList();
            $("#appliedServiceDiv").show();
        }
        else if (type == "COMMUNICATION") {
            $scope.getQuestionAnsData();
            $("#comunicationDivId").show();

        } else if (type == "VIEW-FEED-BACK") {
            getFeedBackData();
            $scope.getQuestionAnsData();
            $("#feedBackDivId").show();

        } else if (type == 'VIEW-APPLICANT') {
            getAppliedServicesData();
            $("#applicationsDiv").show();

        } else if (type === 'VIEW-SERVICE-SUMMARY') {
            $scope.search = "ALL";
            getAppliedServicesData();
            $("#viewServiceSummaryDiv").show();
        }
    }
    $(document).ready(function () {
        $('#serviceAddEditModelId').on('hidden.bs.modal', function (e) {
            $scope.isEdit = false;
            $(".edit-check-cls").prop("checked", false);
        })

    });
});
