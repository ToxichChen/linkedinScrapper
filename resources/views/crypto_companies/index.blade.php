@extends('layouts.app')
@section('content')

    <table id="table_id" class="display">
        <thead>
        <tr>
            <th>ID</th>
            <th>Fundraising Round</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Investors</th>
            <th>Website</th>
            <th>Founder</th>
            <th>Category</th>
            <th>Sub-categories</th>
            <th>Description</th>
            <th>Stages</th>
            <th>Valuation</th>
            <th>Project</th>
            <th>Announcement</th>
        </tr>
        </thead>
        <tbody>
        @foreach ($companies as $company)
            <tr>
                <td>{{$company->id}}</td>
                <td>{{$company->fund_raising_round}}</td>
                <td>{{$company->date}}</td>
                <td>{{$company->amount}}</td>
                <td>{{$company->investors}}</td>
                <td>{{$company->website}}</td>
                <td>{{$company->founder}}</td>
                <td>{{$company->category}}</td>
                <td>{{$company->subcategories}}</td>
                <td>{{$company->description}}</td>
                <td>{{$company->stages}}</td>
                <td>{{$company->valuation}}</td>
                <td>{{$company->project}}</td>
                <td>{{$company->announcement}}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <script>
        $(document).ready(function () {
            $('#table_id').DataTable();
        });
    </script>
@endsection
