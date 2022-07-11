@extends('layouts.app')
@section('content')

    <style>
        body {
            background: #eaeaea;
            margin-top: 20px;
        }

        .profile-info-list {
            padding: 0;
            margin: 0;
            list-style-type: none;
        }

        .profile-info-list > li.title {
            font-size: 0.625rem;
            font-weight: 700;
            color: #8a8a8f;
            padding: 0 0 0.3125rem;
        }

        .profile-info-list > li + li.title {
            padding-top: 1.5625rem;
        }

        .profile-info-list > li {
            padding: 0.625rem 0;
        }

        .profile-info-list > li .field {
            font-weight: 700;
        }

        .profile-info-list > li .value {
            color: #666;
        }

        .profile-info-list > li.img-list a {
            display: inline-block;
        }

        .profile-info-list > li.img-list a img {
            max-width: 2.25rem;
            -webkit-border-radius: 2.5rem;
            -moz-border-radius: 2.5rem;
            border-radius: 2.5rem;
        }

        .coming-soon-cover img,
        .email-detail-attachment .email-attachment .document-file img,
        .email-sender-img img,
        .profile-header-img img {
            max-width: 100%;
        }

        .table.table-profile th {
            border: none;
            color: #000;
            padding-bottom: 0.3125rem;
            padding-top: 0;
        }

        .table.table-profile td {
            border-color: #c8c7cc;
        }

        .table.table-profile tbody + thead > tr > th {
            padding-top: 1.5625rem;
        }

        .table.table-profile .field {
            color: #666;
            font-weight: 600;
            width: 25%;
            text-align: right;
        }

        .table.table-profile .value {
            font-weight: 500;
        }

        .profile-header {
            position: relative;
            overflow: hidden;
        }

        .profile-header .profile-header-cover {
            background-color: gray;
            background-size: 100% auto;
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
        }

        .profile-header .profile-header-cover:before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }

        .profile-header .profile-header-content,
        .profile-header .profile-header-tab,
        .profile-header-img,
        body .fc-icon {
            position: relative;
        }

        .profile-header .profile-header-tab {
            background: #fff;
            list-style-type: none;
            margin: -1.25rem 0 0;
            padding: 0 0 0 8.75rem;
            border-bottom: 1px solid #c8c7cc;
            white-space: nowrap;
        }

        .profile-header .profile-header-tab > li {
            display: inline-block;
            margin: 0;
        }

        .profile-header .profile-header-tab > li > a {
            display: block;
            color: #000;
            line-height: 1.25rem;
            padding: 0.625rem 1.25rem;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.75rem;
            border: none;
        }

        .profile-header .profile-header-tab > li.active > a,
        .profile-header .profile-header-tab > li > a.active {
            color: #007aff;
        }

        .profile-header .profile-header-content:after,
        .profile-header .profile-header-content:before {
            content: "";
            display: table;
            clear: both;
        }

        .profile-header .profile-header-content {
            color: #fff;
            padding: 1.25rem;
        }

        body .fc th a,
        body .fc-ltr .fc-basic-view .fc-day-top .fc-day-number,
        body .fc-widget-header a {
            color: #000;
        }

        .profile-header-img {
            float: left;
            width: 7.5rem;
            height: 7.5rem;
            overflow: hidden;
            z-index: 10;
            margin: 0 1.25rem 0.25rem 0;
            padding: 0.1875rem;
            -webkit-border-radius: 0.25rem;
            -moz-border-radius: 0.25rem;
            border-radius: 0.25rem;
            background: #fff;
        }

        .profile-header-info h4 {
            font-weight: 500;
            margin-bottom: 0.3125rem;
        }

        .profile-container {
            padding: 1.5625rem;
        }

        @media (max-width: 967px) {
            .profile-header-img {
                width: 5.625rem;
                height: 5.625rem;
                margin: 0;
            }

            .profile-header-info {
                margin-left: 6.5625rem;
                padding-bottom: 0.9375rem;
            }

            .profile-header .profile-header-tab {
                padding-left: 0;
            }
        }

        @media (max-width: 767px) {
            .profile-header .profile-header-cover {
                background-position: top;
            }

            .profile-header-img {
                width: 3.75rem;
                height: 3.75rem;
                margin: 0;
            }

            .profile-header-info {
                margin-left: 4.6875rem;
                padding-bottom: 0.9375rem;
            }

            .profile-header-info h4 {
                margin: 0 0 0.3125rem;
            }

            .profile-header .profile-header-tab {
                white-space: nowrap;
                overflow: scroll;
                padding: 0;
            }

            .profile-container {
                padding: 0.9375rem 0.9375rem 3.6875rem;
            }
        }

        .profile-info-list {
            padding: 0;
            margin: 0;
            list-style-type: none;
        }

        .profile-info-list > li.title {
            font-size: 0.625rem;
            font-weight: 700;
            color: #8a8a8f;
            padding: 0 0 0.3125rem;
        }

        .profile-info-list > li + li.title {
            padding-top: 1.5625rem;
        }

        .profile-info-list > li {
            padding: 0.625rem 0;
        }

        .profile-info-list > li .field {
            font-weight: 700;
        }

        .profile-info-list > li .value {
            color: #666;
        }

        .profile-info-list > li.img-list a {
            display: inline-block;
        }

        .profile-info-list > li.img-list a img {
            max-width: 2.25rem;
            -webkit-border-radius: 2.5rem;
            -moz-border-radius: 2.5rem;
            border-radius: 2.5rem;
        }

        .coming-soon-cover img,
        .email-detail-attachment .email-attachment .document-file img,
        .email-sender-img img,
        .profile-header-img img {
            max-width: 100%;
        }

        .table.table-profile th {
            border: none;
            color: #000;
            padding-bottom: 0.3125rem;
            padding-top: 0;
        }

        .table.table-profile td {
            border-color: #c8c7cc;
        }

        .table.table-profile tbody + thead > tr > th {
            padding-top: 1.5625rem;
        }

        .table.table-profile .field {
            color: #666;
            font-weight: 600;
            width: 25%;
            text-align: right;
        }

        .table.table-profile .value {
            font-weight: 500;
        }

    </style>

    <div class="container">
        <div id="content" class="content p-0">
            <div class="profile-header">
                <div class="profile-header-cover"></div>

                <div class="profile-header-content">
                    <div class="profile-header-img">
                        <img src="{{$employee->img_url}}" alt=""/>
                    </div>

                    <div class="profile-header-info">
                        <h4 class="m-t-sm">{{$employee->full_name}}</h4>
                        <p class="m-b-sm">{{$employee->headline}}</p>
                        <p class="m-b-sm">{{$employee->description }}</p>
                    </div>
                </div>
            </div>

            <div class="profile-container">
                <div class="row row-space-20">
                    <div class="col-md-8">
                        <div class="tab-content p-0">
                            <div class="tab-pane active show" id="profile-about">
                                <table class="table table-profile">
                                    <thead>
                                    <tr>
                                        <th colspan="2">WORK AND EDUCATION</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td class="field">Work</td>
                                        <td class="value">
                                            @foreach($employeeJobs as $job)
                                                <div class="m-b-5">
                                                    <b>{{$job->company}}</b> <br/>
                                                    Title: <span class="text-muted">{{$job->job_title}}</span><br/>
                                                    @if($job->location != '' && $job->location != 'undefined')
                                                        Location: <span class="text-muted">{{$job->job_location}}</span>
                                                        <br/>
                                                    @endif
                                                    Date range: <span class="text-muted">{{$job->job_date_range}}</span><br/>
                                                    @if($job->job_description != '' && $job->job_description != 'undefined')
                                                        Description: <span
                                                            class="text-muted">{{$job->job_description}}</span>
                                                    @endif
                                                </div>
                                                <hr>
                                            @endforeach
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="field">Education</td>
                                        <td class="value">
                                            @foreach($employeeEducations as $education)
                                                <div class="m-b-5">
                                                    <b>{{$education->school}}</b> <br/>
                                                    School Degree: <span
                                                        class="text-muted">{{$education->school_degree}}</span><br/>
                                                    School Date Range: <span
                                                        class="text-muted">{{$education->school_date_range}}</span><br/>
                                                    @if($education->school_url != '' && $education->school_url != 'undefined')
                                                        School Url: <span
                                                            class="text-muted">{{$education->school_url}}</span>
                                                        <br/>
                                                    @endif
                                                </div>
                                                <hr>
                                            @endforeach
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="field">Skills</td>
                                        <td class="value">
                                            @foreach($employeeSkills as $skill)
                                                {{$skill->skill . ', '}}
                                            @endforeach
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                <table class="table table-profile">
                                    <thead>
                                    <tr>
                                        <th colspan="2">CONTACT INFORMATION</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    @if ($employee->email != '' && $employee != 'undefined')
                                        <tr>
                                            <td class="field">Email</td>
                                            <td class="value">
                                                {{$employee->email}}
                                            </td>
                                        </tr>
                                    @endif
                                    <tr>
                                        <td class="field">LinkedIn Link</td>
                                        <td class="value">
                                            {{$employee->profile}}

                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="field">Location</td>
                                        <td class="value">
                                            {{$employee->location}}
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4 hidden-xs hidden-sm">
                        <ul class="profile-info-list">
                            <li class="title">PERSONAL INFORMATION</li>
                            <li>
                                <div class="field">Headline:</div>
                                <div class="value">{{$employee->headline}}</div>
                            </li>
                            <li>
                                <div class="field">Skills:</div>
                                <div class="value">
                                    @foreach($employeeSkills as $skill)
                                        {{$skill->skill . ', '}}
                                    @endforeach
                                </div>
                            </li>
                            <li>
                                <div class="field">Location:</div>
                                <div class="value">{{$employee->location}}</div>
                            </li>
                            @if ($employee->email != '' && $employee != 'undefined')
                                <li>
                                    <div class="field">Email:</div>
                                    <div class="value">
                                        {{$employee->email}}
                                    </div>
                                </li>
                            @endif
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

@endsection
