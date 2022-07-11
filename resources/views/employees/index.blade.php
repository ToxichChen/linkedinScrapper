@extends('layouts.app')
@section('content')

    <div class="container">
        <form method="POST" action="/">
            @csrf
            <div class="row">
                <div class="col">
                    <label for="company">Company</label>
                    <select id="company" name="company" class="form-control">
                        <option value="">- - -</option>
                        @foreach($companies as $company)
                            <option value="{{$company->id}}">{{$company->company_name}}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col">
                    <label for="title">Title</label>
                    <select id="title" name="title" class="form-control">
                        <option value="">- - -</option>
                        @foreach($titles as $title)
                            <option value="{{$title->title}}">{{$title->title}}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col">
                    <label for="education">Education</label>
                    <select id="education" name="education" class="form-control">
                        <option value="">- - -</option>
                        @foreach($educations as $education)
                            <option value="{{$education->school}}">{{$education->school}}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col">
                    <label for="location">Location</label>
                    <select id="location" name="location" class="form-control">
                        <option value="">- - -</option>
                        @foreach($locations as $location)
                            <option value="{{$location->location}}">{{$location->location}}</option>
                        @endforeach
                    </select>
                </div>
                <div class="col">
                    <label for="past_company">Past Company</label>
                    <select id="past_company" name="past_company" class="form-control">
                        <option value="">- - -</option>
                        @foreach($pastJobs as $pastJob)
                            <option value="{{$pastJob->company}}">{{$pastJob->company}}</option>
                        @endforeach
                    </select>
                </div>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Find</button>
        </form>
    </div>

    <br>

    <div style="overflow-x: visible;">
        <table id="table_id" class="display">
            <thead>
            <tr>
                <th>Name</th>
                <th>Lastname</th>
                <th>LinkedIn URL</th>
                <th>Company</th>
                <th>Title</th>
                <th>Location</th>
                <th>Is Active employee</th>
                <th>Past employee duration</th>
                <th>&nbsp</th>
            </tr>
            </thead>
            <tbody>
            @foreach ($employees as $employee)
                <tr>
                    <td>{{$employee->name}}</td>
                    <td>{{$employee->last_name}}</td>
                    <td>{{$employee->linkedin_url}}</td>
                    <td>{{$employee->company_name}}</td>
                    <td>{{$employee->title}}</td>
                    <td>{{$employee->location}}</td>
                    <td>@if ($employee->is_active_employee == 1) active @else past @endif</td>
                    <td>{{$employee->past_experience_date}}</td>
                    <td>
                        @if ($employee->is_parsed === 1)
                            <a role="button" href="/employee/show/{{$employee->id}}"
                               class="btn btn-primary">Show</a>
                        @endif
                    </td>
                </tr>
            @endforeach
            </tbody>
        </table>
    </div>

    <script>
        $(document).ready(function () {
            $('#table_id').DataTable({
                scrollX: true,
            });
        });
    </script>
@endsection
